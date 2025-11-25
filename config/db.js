import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Database connected successfully.");

    const createTableQuery = `
            CREATE TABLE IF NOT EXISTS nurse (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                dob DATE NOT NULL,
                age INT NOT NULL,
                license_number VARCHAR(50) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

    await connection.query(createTableQuery);
    console.log("Nurse table created successfully.");

    connection.release();
  } catch (error) {
    console.error("Error creating table:", error);
  }
})();
