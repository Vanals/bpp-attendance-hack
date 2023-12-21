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
    logger: process.stdout // Logger for logging information about requests (optional).
  });
  

const s3 = new AWS.S3();
const BUCKET_NAME = 'bpp-students-attendance';
const DATA_FILE_PATH = 'attendance.json';

async function readAttendanceData() {
    try {
        // Retrieve data from the S3 bucket
        const params = {
            Bucket: BUCKET_NAME,
            Key: DATA_FILE_PATH,
        };

        const response = await s3.getObject(params).promise();
        // @ts-ignore
        const attendanceData = JSON.parse(response.Body.toString('utf-8'));

        return attendanceData;
    } catch (error) {
        console.error('Error reading attendance data:', error.message);
        return null;
    }
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Read attendance data from the S3 bucket
            const attendanceData = await readAttendanceData();

            if (!attendanceData) {
                return res.status(500).json({ error: 'Error reading attendance data' });
            }

            return res.status(200).json({ data: attendanceData });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
