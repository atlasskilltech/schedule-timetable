const pool = require('../config/database');

exports.renderInfraDashboard = (req, res) => {
  res.render('infra-dashboard');
};

exports.getRooms = async (req, res) => {
  const { date } = req.query;
  const selectedDate = date || new Date().toISOString().split('T')[0];

  try {
    const [rows] = await pool.query(`
      SELECT
        dr.room_id,
        dc.class_name AS class,
        dr.room_name,
        dr.room_category,
        dr.room_capacity,
        dt.timetable_id,
        ds.subject_name,
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
      WHERE dr.room_is_delete = 0 AND df.floor_building != ' '
      ORDER BY dr.room_name ASC
    `, [selectedDate]);

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

    res.json({
      success: true,
      data: {
        buildings: buildings.map(b => b.building),
        floors: floors.map(f => f.floor),
        categories: categories.map(c => c.room_category)
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
