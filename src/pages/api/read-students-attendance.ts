
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.resolve('./src/data/attendance.json');

async function readAttendanceData() {
  try {
    // Read data from the JSON file
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    const attendanceData = JSON.parse(fileData);

    return attendanceData;
  } catch (error) {
    console.error('Error reading attendance data:', error.message);
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Read attendance data from the JSON file
      const attendanceData = await readAttendanceData();

      if (!attendanceData) {
        return res.status(500).json({ error: 'Error reading attendance data' });
      }

      console.log(attendanceData, '✅✅')


      return res.status(200).json({ data: attendanceData });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
