import AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-west-2', // e.g., 'us-east-1'
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

            console.log(attendanceData, '✅✅');

            return res.status(200).json({ data: attendanceData });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
