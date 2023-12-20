import { read } from 'fs';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.resolve('./src/data/attendance.json');

async function readAttendanceData() {
  try {
    // Read data from the JSON file
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    console.log(fileData, '🥶🥶🥶🥶')
    const attendanceData = JSON.parse(fileData);

    // Log or use the attendance data as needed
    console.log(attendanceData);

    return attendanceData;
  } catch (error) {
    // Handle errors, such as file not found or JSON parsing error
    console.error('Error reading attendance data:', error.message);
    return null;
  }
}

async function writeAttendanceData(attendanceData) {
  try {
    // Write the updated data back to the JSON file
    await fs.writeFile(dataFilePath, JSON.stringify(attendanceData, null, 2), 'utf-8');
  } catch (error) {
    // Handle errors, such as file not found or write error
    console.error('Error writing attendance data:', error.message);
  }
}


async function addAttendanceRecord(studentId, classId, timestamp) {
  try {
    // Read existing data from the JSON file
    const attendanceData = await readAttendanceData();

    // Find the array for the specified student ID or create a new one
    const studentArray = attendanceData[studentId] || [];

    // Add the new attendance record
    const newAttendanceRecord = {
      class_id: classId,
      timestamp: timestamp || new Date().toISOString(),
    };

    studentArray.push(newAttendanceRecord);

    // Update the attendance data with the new record
    attendanceData[studentId] = studentArray;

    // Write the updated data back to the JSON file
    await writeAttendanceData(attendanceData);

    console.log('Attendance record added successfully:', newAttendanceRecord);
  } catch (error) {
    console.error('Error adding attendance record:', error.message);
  }
}

export default async function handler(req, res) {
  console.log('🔥🔥🔥🔥🔥🔥🔥')
  if (req.method === 'POST') {
    try {
      const { student_id, class_id } = req.body;

      if (!student_id || !class_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await addAttendanceRecord(student_id, class_id, new Date().toISOString())

      return res.status(200).json({ message: 'Attendance marked successfully' });

    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}