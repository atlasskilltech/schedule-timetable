const pool = require('../config/database');

exports.renderInfraDashboard = (req, res) => {
  res.render('infra-dashboard');
};

exports.getRooms = async (req, res) => {
  const { date, program, year, section, faculty, room, subject, day, time } = req.query;
  const selectedDate = date || new Date().toISOString().split('T')[0];

  try {
    let whereConditions = ['dr.room_is_delete = 0', "df.floor_building != ' '"];
    let queryParams = [];

    // Date filter
    whereConditions.push('(dt.timetable_date = ? OR dt.timetable_date IS NULL)');
    queryParams.push(selectedDate);

    // Program (school_id) filter
    if (program && program !== 'all' && program !== '') {
      const programIds = String(program).split(',').filter(Boolean);
      if (programIds.length > 0) {
        whereConditions.push(`dice_school.school_id IN (${programIds.map(() => '?').join(',')})`);
        queryParams.push(...programIds);
      }
    }

    // Year filter
    if (year && year !== 'all' && year !== '') {
      const yearValues = String(year).split(',').filter(Boolean);
      if (yearValues.length > 0) {
        whereConditions.push(`dc.class_course_year IN (${yearValues.map(() => '?').join(',')})`);
        queryParams.push(...yearValues);
      }
    }

    // Section (class_id) filter
    if (section && section !== 'all' && section !== '') {
      const sectionIds = String(section).split(',').filter(Boolean);
      if (sectionIds.length > 0) {
        whereConditions.push(`dc.class_id IN (${sectionIds.map(() => '?').join(',')})`);
        queryParams.push(...sectionIds);
      }
    }

    // Faculty filter
    if (faculty && faculty !== 'all' && faculty !== '') {
      const facultyIds = String(faculty).split(',').filter(Boolean);
      if (facultyIds.length > 0) {
        whereConditions.push(`dt.timetable_faculty IN (${facultyIds.map(() => '?').join(',')})`);
        queryParams.push(...facultyIds);
      }
    }

    // Room filter
    if (room && room !== 'all' && room !== '') {
      const roomIds = String(room).split(',').filter(Boolean);
      if (roomIds.length > 0) {
        whereConditions.push(`dr.room_id IN (${roomIds.map(() => '?').join(',')})`);
        queryParams.push(...roomIds);
      }
    }

    // Subject filter
    if (subject && subject !== 'all' && subject !== '') {
      const subjectIds = String(subject).split(',').filter(Boolean);
      if (subjectIds.length > 0) {
        whereConditions.push(`dt.timetable_subject IN (${subjectIds.map(() => '?').join(',')})`);
        queryParams.push(...subjectIds);
      }
    }

    // Day filter
    if (day && day !== 'all' && day !== '') {
      const dayValues = String(day).split(',').filter(Boolean);
      if (dayValues.length > 0) {
        whereConditions.push(`DAYNAME(dt.timetable_date) IN (${dayValues.map(() => '?').join(',')})`);
        queryParams.push(...dayValues);
      }
    }

    // Time filter
    if (time && time !== 'all' && time !== '') {
      const timeValues = String(time).split(',').filter(Boolean);
      if (timeValues.length > 0) {
        const timeConditions = timeValues.map(t => {
          const [startTime, endTime] = t.split('-');
          if (startTime && endTime) {
            queryParams.push(startTime, endTime);
            return '(TIME(dt.timetable_start_time) >= ? AND TIME(dt.timetable_end_time) <= ?)';
          }
          return null;
        }).filter(Boolean);
        if (timeConditions.length > 0) {
          whereConditions.push(`(${timeConditions.join(' OR ')})`);
        }
      }
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const [rows] = await pool.query(`
      SELECT
        dr.room_id,
        dc.class_name AS class,
        dr.room_name,
        dr.room_category,
        dr.room_capacity,
        dt.timetable_id,
        ds.subject_name,
        ds.subject_code,
        dfc.faculty_first_name,
        dfc.faculty_last_name,
        TIME_FORMAT(dt.timetable_start_time, '%H:%i') AS start,
        TIME_FORMAT(dt.timetable_end_time, '%H:%i') AS end,
        df.floor_name AS floor,
        df.floor_building AS building,
        dice_school.school_id
      FROM dice_room dr
      JOIN dice_floor df ON df.floor_id = dr.room_floor
      LEFT JOIN dice_timetable dt ON dt.timetable_room = dr.room_id
        AND (dt.timetable_date = ? OR dt.timetable_date IS NULL)
      LEFT JOIN dice_subject ds ON ds.subject_id = dt.timetable_subject
      LEFT JOIN dice_faculties dfc ON dfc.faculty_id = dt.timetable_faculty
      LEFT JOIN dice_timetable_class dtc ON dtc.timetable_id = dt.timetable_id
      LEFT JOIN dice_class dc ON dc.class_id = dtc.class_id
      LEFT JOIN dice_cluster ON dice_cluster.cluster_id = dc.class_cluster_id
      LEFT JOIN dice_school ON dice_school.school_id = dice_cluster.cluster_school
      ${whereClause}
      ORDER BY dr.room_name ASC
    `, [selectedDate, ...queryParams]);

    const roomMap = new Map();
    rows.forEach(row => {
      if (!roomMap.has(row.room_id)) {
        roomMap.set(row.room_id, {
          room_id: row.room_id,
          room_name: row.room_name,
          room_capacity: row.room_capacity,
          room_category: row.room_category || 'Others',
          floor: row.floor,
          building: row.building,
          schedules: []
        });
      }
      if (row.timetable_id) {
        roomMap.get(row.room_id).schedules.push({
          timetable_id: row.timetable_id,
          subject_name: row.subject_name,
          subject_code: row.subject_code,
          class: row.class,
          faculty_first_name: row.faculty_first_name,
          faculty_last_name: row.faculty_last_name,
          start: row.start,
          end: row.end,
          school_id: row.school_id
        });
      }
    });

    res.json({ success: true, data: Array.from(roomMap.values()) });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getFilterOptions = async (req, res) => {
  try {
    const [buildings] = await pool.query(`SELECT DISTINCT floor_building AS building FROM dice_floor WHERE floor_building != ' ' ORDER BY floor_building ASC`);
    const [floors] = await pool.query(`SELECT DISTINCT floor_name AS floor FROM dice_floor WHERE floor_building != ' ' ORDER BY floor_name ASC`);
    const [categories] = await pool.query(`SELECT DISTINCT room_category FROM dice_room WHERE room_is_delete = 0 AND room_category IS NOT NULL AND room_category != '' ORDER BY room_category ASC`);
    const [classes] = await pool.query(`SELECT DISTINCT class_name FROM dice_class WHERE class_name IS NOT NULL AND class_name != '' ORDER BY class_name ASC`);

    res.json({
      success: true,
      data: {
        buildings: buildings.map(b => b.building),
        floors: floors.map(f => f.floor),
        categories: categories.map(c => c.room_category),
        classes: classes.map(c => c.class_name)
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getExtendedFilterOptions = async (req, res) => {
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

exports.getStatistics = async (req, res) => {
  const { date } = req.query;
  const selectedDate = date || new Date().toISOString().split('T')[0];

  try {
    const [stats] = await pool.query(`
      SELECT
        COUNT(DISTINCT dr.room_id) AS total_rooms,
        COUNT(DISTINCT CASE WHEN dt.timetable_id IS NOT NULL THEN dr.room_id END) AS occupied_rooms
      FROM dice_room dr
      LEFT JOIN dice_timetable dt ON dt.timetable_room = dr.room_id AND dt.timetable_date = ?
      JOIN dice_floor ON dice_floor.floor_id = dr.room_floor AND floor_building != ' '
      WHERE dr.room_is_delete = 0
    `, [selectedDate]);

    const total = stats[0].total_rooms;
    const occupied = stats[0].occupied_rooms;

    res.json({
      success: true,
      data: {
        total_rooms: total,
        occupied_rooms: occupied,
        available_rooms: total - occupied,
        occupancy_rate: total > 0 ? Math.round((occupied / total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
