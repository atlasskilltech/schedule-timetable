const pool = require('../config/database');

exports.renderDashboard = (req, res) => {
  res.render('dashboard');
};

exports.getDashboardStats = async (req, res) => {
  try {
    const { date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    // Get total scheduled for the date
    const [scheduled] = await pool.query(`
      SELECT COUNT(DISTINCT dt.timetable_id) as total_scheduled
      FROM dice_timetable dt
      WHERE dt.timetable_date = ?
    `, [selectedDate]);
    
    // Get total unscheduled (classes without timetable on this date)
    const [unscheduled] = await pool.query(`
      SELECT COUNT(DISTINCT dc.class_id) as total_unscheduled
      FROM dice_class dc
      JOIN dice_cluster dcl ON dcl.cluster_id = dc.class_cluster_id
      WHERE dc.class_active = 0 
      AND dc.class_type = 1
      AND dcl.cluster_active = 0
      AND NOT EXISTS (
        SELECT 1 FROM dice_timetable dt
        JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
        WHERE dtc.class_id = dc.class_id AND dt.timetable_date = ?
      )
    `, [selectedDate]);
    
    res.json({
      success: true,
      data: {
        total_scheduled: scheduled[0].total_scheduled || 0,
        total_unscheduled: unscheduled[0].total_unscheduled || 0
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTimetableData = async (req, res) => {
  try {
    const { program, year, section, faculty, room, subject, day, time, date } = req.query;
    const selectedDate = date || new Date().toISOString().split('T')[0];
    
    let whereConditions = ['dt.timetable_date = ?', 'dr.room_is_delete = 0', "df.floor_building != ' '"];
    let queryParams = [selectedDate];
    
    if (program && program !== 'all') {
      whereConditions.push('dice_school.school_id = ?');
      queryParams.push(program);
    }
    
    if (year && year !== 'all') {
      whereConditions.push('dc.class_course_year as class_year = ?');
      queryParams.push(year);
    }
    
    if (section && section !== 'all') {
      whereConditions.push('dc.class_id = ?');
      queryParams.push(section);
    }
    
    if (faculty && faculty !== 'all') {
      whereConditions.push('dt.timetable_faculty = ?');
      queryParams.push(faculty);
    }
    
    if (room && room !== 'all') {
      whereConditions.push('dt.timetable_room = ?');
      queryParams.push(room);
    }
    
    if (subject && subject !== 'all') {
      whereConditions.push('dt.timetable_subject = ?');
      queryParams.push(subject);
    }
    
    if (day && day !== 'all') {
      whereConditions.push('DAYNAME(dt.timetable_date) = ?');
      queryParams.push(day);
    }
    
    if (time && time !== 'all') {
      const [startTime, endTime] = time.split('-');
      if (startTime && endTime) {
        whereConditions.push('TIME(dt.timetable_start_time) >= ? AND TIME(dt.timetable_end_time) <= ?');
        queryParams.push(startTime, endTime);
      }
    }
    
    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    
    const query = `
      SELECT 
        dt.timetable_id,
        dt.timetable_date,
        TIME_FORMAT(dt.timetable_start_time, '%H:%i') as start_time,
        TIME_FORMAT(dt.timetable_end_time, '%H:%i') as end_time,
        ds.subject_name,
        ds.subject_code,
        dr.room_name,
        dr.room_id,
        df.floor_name,
        df.floor_building,
        dfc.faculty_first_name,
        dfc.faculty_last_name,
        dfc.faculty_id,
        dc.class_name,
        dc.class_id,
        dc.class_course_year as class_year,
        dice_school.school_name,
        dice_school.school_id,
        dice_school.school_id as school_code,
        DAYNAME(dt.timetable_date) as day_name
      FROM dice_timetable dt
      LEFT JOIN dice_subject ds ON ds.subject_id = dt.timetable_subject
      LEFT JOIN dice_room dr ON dr.room_id = dt.timetable_room
      LEFT JOIN dice_floor df ON df.floor_id = dr.room_floor
      LEFT JOIN dice_faculties dfc ON dfc.faculty_id = dt.timetable_faculty
      LEFT JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
      LEFT JOIN dice_class dc ON dc.class_id = dtc.class_id
      LEFT JOIN dice_cluster ON dice_cluster.cluster_id = dc.class_cluster_id
      LEFT JOIN dice_school ON dice_school.school_id = dice_cluster.cluster_school
      ${whereClause}
      ORDER BY dt.timetable_start_time ASC
    `;
    
    const [rows] = await pool.query(query, queryParams);
    
    // Group by day
    const groupedByDay = rows.reduce((acc, row) => {
      const day = row.day_name;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(row);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: groupedByDay,
      total: rows.length
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFilterOptions = async (req, res) => {
  try {
    const [programs] = await pool.query(`
      SELECT DISTINCT school_id, school_name, school_id as school_code 
      FROM dice_school 
      WHERE school_id > 6
      ORDER BY school_name
    `);
    
    const [years] = await pool.query(`
      SELECT DISTINCT class_course_year as class_year 
      FROM dice_class 
      WHERE class_active = 0 
      ORDER BY class_course_year
    `);
    
    const [sections] = await pool.query(`
      SELECT DISTINCT class_name, class_id 
      FROM dice_class 
      WHERE class_active = 0 AND class_type = 1 
      ORDER BY class_name
    `);
    
    const [faculties] = await pool.query(`
      SELECT faculty_id, faculty_first_name, faculty_last_name 
      FROM dice_faculties 
      WHERE faculty_active = 0 
      ORDER BY faculty_first_name
    `);
    
    const [rooms] = await pool.query(`
      SELECT dr.room_id, dr.room_name, df.floor_building, df.floor_name
      FROM dice_room dr
      JOIN dice_floor df ON df.floor_id = dr.room_floor
      WHERE dr.room_is_delete = 0 AND df.floor_building != ' '
      ORDER BY dr.room_name
    `);
    
    const [subjects] = await pool.query(`
      SELECT subject_id, subject_name, subject_code 
      FROM dice_subject 
      WHERE subject_active = 0 
      ORDER BY subject_name
    `);
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const times = [
      { label: 'Morning (07:30 - 12:00)', value: '07:30-12:00' },
      { label: 'Afternoon (12:00 - 16:00)', value: '12:00-16:00' },
      { label: 'Evening (16:00 - 20:00)', value: '16:00-20:00' }
    ];
    
    res.json({
      success: true,
      data: {
        programs,
        years: years.map(y => y.class_year),
        sections,
        faculties,
        rooms,
        subjects,
        days,
        times
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};