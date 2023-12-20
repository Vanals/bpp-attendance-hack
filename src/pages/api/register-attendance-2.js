import AWS from 'aws-sdk';

AWS.config.update({
    region: 'us-west-2', // Set your preferred AWS region
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Your AWS Access Key ID
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Your AWS Secret Access Key
    sessionToken: process.env.AWS_SESSION_TOKEN, // Session token if using temporary credentials (optional)
    httpOptions: {
      timeout: 10000, // Timeout in milliseconds (default is 120000)
      connectTimeout: 5000 // Connection timeout in milliseconds (optional)
    },
    logger: process.stdout // Logger for logging information about requests (optional)
  });

const s3 = new AWS.S3();
const s3BucketName = 'bpp-students-attendance'
const DATA_FILE_PATH = 'attendance.json';

async function readAttendanceData() {
  try {
    // Retrieve data from the S3 bucket
    const params = {
      Bucket: s3BucketName,
      Key: DATA_FILE_PATH,
    };

    const response = await s3.getObject(params).promise();
    const attendanceData = JSON.parse(response.Body.toString('utf-8'));

    return attendanceData;
  } catch (error) {
    console.error('Error reading attendance data:', error.message);
    return null;
  }
}

async function writeAttendanceData(attendanceData) {
  try {
    // Write the updated data back to the S3 bucket
    const params = {
      Bucket: s3BucketName,
      Key: DATA_FILE_PATH,
      Body: JSON.stringify(attendanceData, null, 2),
      ContentType: 'application/json',
    };

    await s3.putObject(params).promise();
  } catch (error) {
    console.error('Error writing attendance data:', error.message);
  }
}

async function addAttendanceRecord(studentId, classId, timestamp) {
  try {
    // Read existing data from the S3 bucket
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

    // Write the updated data back to the S3 bucket
    await writeAttendanceData(attendanceData);

    console.log('Attendance record added successfully:', newAttendanceRecord);
  } catch (error) {
    console.error('Error adding attendance record:', error.message);
  }
}

export default async function handler(req, res) {
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
