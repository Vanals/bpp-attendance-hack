'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/read-students-attendance');

        if (response.status !== 200) {
          throw new Error(`Request failed with status: ${response.status}`);
        }

        const jsonData = response.data;
        setData(jsonData.data);
      } catch (error) {
        console.error('Error fetching data:', error.message);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Function to check if a timestamp is today
  const isToday = (timestamp) => {
    const today = new Date();
    const recordDate = new Date(timestamp);
    return (
      today.getDate() === recordDate.getDate() &&
      today.getMonth() === recordDate.getMonth() &&
      today.getFullYear() === recordDate.getFullYear()
    );
  };

  return (
    <div>
      <h1>Students Attendance Data</h1>
      <br/>
      <br/>
      
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([studentId, records]) => {
            const attendanceRecords = Array.isArray(records) ? records : [];

            // Check if there is any record for today
            const hasRecordForToday = attendanceRecords.some((record) => isToday(record.timestamp));

            return (
              <tr key={studentId}>
                <td>{studentId}</td>
                <td>
                  {/* Display a green or red circle based on the condition */}
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: hasRecordForToday ? 'green' : 'red',
                    }}
                  ></div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Now, mark the component as a client component
export const useClient = true;
