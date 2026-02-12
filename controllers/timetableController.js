const pool = require('../config/database');

exports.renderByDivision = (req, res) => {
  res.render('timetable-by-division');
};

exports.renderByFaculty = (req, res) => {
  res.render('timetable-by-faculty');
};

exports.renderByDay = (req, res) => {
  res.render('timetable-by-day');
};

exports.getByDivision = async (req, res) => {
  try {
    const { date, program } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    let whereClause = 'WHERE dt.timetable_date = ? AND dc.class_active = 0 AND dice_cluster.cluster_active = 0';
    let params = [selectedDate];
    
    if (program && program !== 'all') {
      whereClause += ' AND dice_school.school_id = ?';
      params.push(program);
    }
    
    const query = `
      SELECT 
        dc.class_name,
        dc.class_id,
        dice_school.school_name,
        dice_school.school_id as school_code,
        dice_school.school_id,
        COUNT(dt.timetable_id) as total_classes,
        MIN(TIME_FORMAT(dt.timetable_start_time, '%H:%i')) as first_class,
        MAX(TIME_FORMAT(dt.timetable_end_time, '%H:%i')) as last_class
      FROM dice_timetable dt
      JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
      JOIN dice_class dc ON dc.class_id = dtc.class_id
      JOIN dice_cluster ON dice_cluster.cluster_id = dc.class_cluster_id
      JOIN dice_school ON dice_school.school_id = dice_cluster.cluster_school
      ${whereClause}
      GROUP BY dc.class_id, dc.class_name, dice_school.school_name, dice_school.school_id, dice_school.school_id
      ORDER BY dice_school.school_name, dc.class_name
    `;
    
    const [divisions] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: divisions
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDivisionDetails = async (req, res) => {
  try {
    const { classId, date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        dt.timetable_id,
        TIME_FORMAT(dt.timetable_start_time, '%H:%i') as start_time,
        TIME_FORMAT(dt.timetable_end_time, '%H:%i') as end_time,
        ds.subject_name,
        ds.subject_code,
        dr.room_name,
        df.floor_building,
        dfc.faculty_first_name,
        dfc.faculty_last_name,
        dc.class_name
      FROM dice_timetable dt
      JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
      JOIN dice_class dc ON dc.class_id = dtc.class_id
      LEFT JOIN dice_subject ds ON ds.subject_id = dt.timetable_subject
      LEFT JOIN dice_room dr ON dr.room_id = dt.timetable_room
      LEFT JOIN dice_floor df ON df.floor_id = dr.room_floor
      LEFT JOIN dice_faculties dfc ON dfc.faculty_id = dt.timetable_faculty
      WHERE dc.class_id = ? AND dt.timetable_date = ?
      ORDER BY dt.timetable_start_time
    `;
    
    const [classes] = await pool.query(query, [classId, selectedDate]);
    
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getByFaculty = async (req, res) => {
  try {
    const { date, facultyId } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    let whereClause = 'WHERE dt.timetable_date = ?';
    let params = [selectedDate];
    
    if (facultyId && facultyId !== 'all') {
      whereClause += ' AND dfc.faculty_id = ?';
      params.push(facultyId);
    }
    
    const query = `
      SELECT 
        dfc.faculty_id,
        dfc.faculty_first_name,
        dfc.faculty_last_name,
        COUNT(dt.timetable_id) as total_classes,
        MIN(TIME_FORMAT(dt.timetable_start_time, '%H:%i')) as first_class,
        MAX(TIME_FORMAT(dt.timetable_end_time, '%H:%i')) as last_class,
        GROUP_CONCAT(DISTINCT dice_school.school_name SEPARATOR ', ') as schools
      FROM dice_timetable dt
      JOIN dice_faculties dfc ON dfc.faculty_id = dt.timetable_faculty
      LEFT JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
      LEFT JOIN dice_class dc ON dc.class_id = dtc.class_id
      LEFT JOIN dice_cluster ON dice_cluster.cluster_id = dc.class_cluster_id
      LEFT JOIN dice_school ON dice_school.school_id = dice_cluster.cluster_school
      ${whereClause}
      GROUP BY dfc.faculty_id, dfc.faculty_first_name, dfc.faculty_last_name
      ORDER BY dfc.faculty_first_name, dfc.faculty_last_name
    `;
    
    const [faculties] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: faculties
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFacultyDetails = async (req, res) => {
  try {
    const { facultyId, date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    const query = `
      SELECT 
        dt.timetable_id,
        TIME_FORMAT(dt.timetable_start_time, '%H:%i') as start_time,
        TIME_FORMAT(dt.timetable_end_time, '%H:%i') as end_time,
        ds.subject_name,
        ds.subject_code,
        dr.room_name,
        df.floor_building,
        dc.class_name,
        dice_school.school_name
      FROM dice_timetable dt
      LEFT JOIN dice_subject ds ON ds.subject_id = dt.timetable_subject
      LEFT JOIN dice_room dr ON dr.room_id = dt.timetable_room
      LEFT JOIN dice_floor df ON df.floor_id = dr.room_floor
      LEFT JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
      LEFT JOIN dice_class dc ON dc.class_id = dtc.class_id
      LEFT JOIN dice_cluster ON dice_cluster.cluster_id = dc.class_cluster_id
      LEFT JOIN dice_school ON dice_school.school_id = dice_cluster.cluster_school
      WHERE dt.timetable_faculty = ? AND dt.timetable_date = ?
      ORDER BY dt.timetable_start_time
    `;
    
    const [classes] = await pool.query(query, [facultyId, selectedDate]);
    
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getByDay = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate || new Date().toISOString().split('T')[0];
    const end = endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const query = `
      SELECT 
        dt.timetable_date,
        DAYNAME(dt.timetable_date) as day_name,
        COUNT(dt.timetable_id) as total_classes,
        COUNT(DISTINCT dt.timetable_room) as rooms_used,
        COUNT(DISTINCT dt.timetable_faculty) as faculties_involved,
        MIN(TIME_FORMAT(dt.timetable_start_time, '%H:%i')) as first_class,
        MAX(TIME_FORMAT(dt.timetable_end_time, '%H:%i')) as last_class
      FROM dice_timetable dt
      WHERE dt.timetable_date BETWEEN ? AND ?
      GROUP BY dt.timetable_date
      ORDER BY dt.timetable_date
    `;
    
    const [days] = await pool.query(query, [start, end]);
    
    res.json({
      success: true,
      data: days
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDayDetails = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Convert ISO date → YYYY-MM-DD
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    
    const query = `
      SELECT 
        dt.timetable_id,
        TIME_FORMAT(dt.timetable_start_time, '%H:%i') as start_time,
        TIME_FORMAT(dt.timetable_end_time, '%H:%i') as end_time,
        ds.subject_name,
        ds.subject_code,
        dr.room_name,
        df.floor_building,
        dfc.faculty_first_name,
        dfc.faculty_last_name,
        dc.class_name,
        dice_school.school_name,
        dice_school.school_id as school_code
      FROM dice_timetable dt
      LEFT JOIN dice_subject ds ON ds.subject_id = dt.timetable_subject
      LEFT JOIN dice_room dr ON dr.room_id = dt.timetable_room
      LEFT JOIN dice_floor df ON df.floor_id = dr.room_floor
      LEFT JOIN dice_faculties dfc ON dfc.faculty_id = dt.timetable_faculty
      LEFT JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
      LEFT JOIN dice_class dc ON dc.class_id = dtc.class_id
      LEFT JOIN dice_cluster ON dice_cluster.cluster_id = dc.class_cluster_id
      LEFT JOIN dice_school ON dice_school.school_id = dice_cluster.cluster_school
      WHERE dt.timetable_date = ?
      ORDER BY dt.timetable_start_time
    `;
    
    const [classes] = await pool.query(query, [formattedDate]);
    
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};