const pool = require('../config/database');

exports.renderClassrooms = (req, res) => {
  res.render('classrooms');
};

exports.renderUnscheduled = (req, res) => {
  res.render('unscheduled');
};

exports.getClassrooms = async (req, res) => {
  try {
    const { date, building, floor } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    let whereConditions = ['dr.room_is_delete = 0', "df.floor_building != ' '"];
    let params = [];
    
    if (building && building !== 'all') {
      whereConditions.push('df.floor_building = ?');
      params.push(building);
    }
    
    if (floor && floor !== 'all') {
      whereConditions.push('df.floor_name = ?');
      params.push(floor);
    }
    
    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    
    const query = `
      SELECT 
        dr.room_id,
        dr.room_name,
        df.floor_name,
        df.floor_building,
        COUNT(CASE WHEN dt.timetable_date = ? THEN dt.timetable_id END) as classes_today,
        MIN(CASE WHEN dt.timetable_date = ? THEN TIME_FORMAT(dt.timetable_start_time, '%H:%i') END) as first_class,
        MAX(CASE WHEN dt.timetable_date = ? THEN TIME_FORMAT(dt.timetable_end_time, '%H:%i') END) as last_class,
        CASE 
          WHEN COUNT(CASE WHEN dt.timetable_date = ? THEN dt.timetable_id END) = 0 THEN 'Available'
          ELSE 'In Use'
        END as status
      FROM dice_room dr
      JOIN dice_floor df ON df.floor_id = dr.room_floor
      LEFT JOIN dice_timetable dt ON dt.timetable_room = dr.room_id
      ${whereClause}
      GROUP BY dr.room_id, dr.room_name, df.floor_name, df.floor_building
      ORDER BY df.floor_building, df.floor_name, dr.room_name
    `;
    
    const [rooms] = await pool.query(query, [selectedDate, selectedDate, selectedDate, selectedDate, ...params]);
    
    res.json({
      success: true,
      data: rooms
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getClassroomSchedule = async (req, res) => {
  try {
    const { roomId, date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        dt.timetable_id,
        TIME_FORMAT(dt.timetable_start_time, '%H:%i') as start_time,
        TIME_FORMAT(dt.timetable_end_time, '%H:%i') as end_time,
        ds.subject_name,
        ds.subject_code,
        dfc.faculty_first_name,
        dfc.faculty_last_name,
        dc.class_name,
        dice_school.school_name,
        dice_school.school_id as school_code
      FROM dice_timetable dt
      LEFT JOIN dice_subject ds ON ds.subject_id = dt.timetable_subject
      LEFT JOIN dice_faculties dfc ON dfc.faculty_id = dt.timetable_faculty
      LEFT JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
      LEFT JOIN dice_class dc ON dc.class_id = dtc.class_id
      LEFT JOIN dice_cluster dcl ON dcl.cluster_id = dc.class_cluster_id
      LEFT JOIN dice_school ON dice_school.school_id = dcl.cluster_school
      WHERE dt.timetable_room = ? AND dt.timetable_date = ?
      ORDER BY dt.timetable_start_time
    `;
    
    const [schedule] = await pool.query(query, [roomId, selectedDate]);
    
    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUnscheduled = async (req, res) => {
  try {
    const { date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    // Get classes without timetable entries for the selected date
    const classQuery = `
      SELECT 
        dc.class_id,
        dc.class_name,
        dc.class_course_year as class_year,
        dice_school.school_name,
        dice_school.school_id as school_code,
        'No Schedule' as reason
      FROM dice_class dc
      JOIN dice_cluster dcl ON dcl.cluster_id = dc.class_cluster_id
      JOIN dice_school ON dice_school.school_id = dcl.cluster_school
      WHERE dc.class_active = 0 
      AND dc.class_type = 1
      AND NOT EXISTS (
        SELECT 1 FROM dice_timetable dt
        JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
        WHERE dtc.class_id = dc.class_id AND dt.timetable_date = ?
      )
      ORDER BY dice_school.school_name, dc.class_name
    `;
    
    // Get faculties without timetable entries for the selected date
    const facultyQuery = `
      SELECT 
        dfc.faculty_id,
        dfc.faculty_first_name,
        dfc.faculty_last_name,
        'Not Assigned' as reason
      FROM dice_faculties dfc
      WHERE dfc.faculty_active = 0
      AND NOT EXISTS (
        SELECT 1 FROM dice_timetable dt
        WHERE dt.timetable_faculty = dfc.faculty_id AND dt.timetable_date = ?
      )
      ORDER BY dfc.faculty_first_name, dfc.faculty_last_name
    `;
    
    // Get rooms without timetable entries for the selected date
    const roomQuery = `
      SELECT 
        dr.room_id,
        dr.room_name,
        df.floor_name,
        df.floor_building,
        'Available All Day' as reason
      FROM dice_room dr
      JOIN dice_floor df ON df.floor_id = dr.room_floor
      WHERE dr.room_is_delete = 0 
      AND df.floor_building != ' '
      AND NOT EXISTS (
        SELECT 1 FROM dice_timetable dt
        WHERE dt.timetable_room = dr.room_id AND dt.timetable_date = ?
      )
      ORDER BY df.floor_building, df.floor_name, dr.room_name
    `;
    
    const [classes] = await pool.query(classQuery, [selectedDate]);
    const [faculties] = await pool.query(facultyQuery, [selectedDate]);
    const [rooms] = await pool.query(roomQuery, [selectedDate]);
    
    res.json({
      success: true,
      data: {
        classes,
        faculties,
        rooms,
        total: classes.length + faculties.length + rooms.length
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
