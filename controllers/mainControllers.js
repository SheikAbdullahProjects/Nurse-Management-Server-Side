import { db } from "../config/db.js";
import ExcelJS from "exceljs";

// export const getAllNurseData = async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM nurse");
//     res.status(200).json({ success: true, data: rows });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getAllNurseData = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "id",
      sortOrder = "ASC",
    } = req.query;

    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    const allowableSortBy = ["id", "name", "age", "dob", "license_number"];
    if (!allowableSortBy.includes(sortBy)) {
      sortBy = "id";
    }

    sortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    let where = "WHERE 1=1";
    let searchParams = [];
    if (search) {
      where += ` AND (name LIKE ? OR license_number LIKE ?)`;
      searchParams.push(`%${search}%`, `%${search}%`);
    }
    const [countRows] = await db.query(
      `SELECT COUNT(*) as count FROM nurse ${where}`,
      search ? searchParams : []
    );
    const total = countRows[0].count;
    const [rows] = await db.query(
      `SELECT * FROM nurse ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
      search ? [...searchParams, limit, offset] : [limit, offset]
    );
    res.status(200).json({ success: true, data: rows, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSingleNurseData = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM nurse WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Nurse not found" });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const createNurseData = async (req, res) => {
  try {
    const { name, age, dob, license_number } = req.body;
    const [result] = await db.query(
      "INSERT INTO nurse (name, age, dob, license_number) VALUES (?, ?, ?, ?)",
      [name, age, dob, license_number]
    );
    res
      .status(201)
      .json({ success: true, message: "Nurse created", id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const DeleteNurseData = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM nurse WHERE id = ?", [
      Number(id),
    ]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Nurse not found" });
    }
    res.status(200).json({ success: true, message: "Nurse deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const exportNurseDataToCSV = async (req, res) => {
  try {
    const { search } = req.query;

    let query = "SELECT name, age, dob, license_number FROM nurse WHERE 1=1";
    let params = [];

    if (search) {
      query += " AND (name LIKE ? OR license_number LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await db.query(query, params);

    let csv = "Name,Age,DOB,License Number\n";

    rows.forEach((r) => {
      csv += `${r.name},${r.age},${r.dob},${r.license_number}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=nurses.csv");
    res.send(csv);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating CSV" });
  }
};


export const exportNurseDataToExcel = async (req, res) => {
  try {
    const { search } = req.query;

    let query = "SELECT name, age, dob, license_number FROM nurse WHERE 1=1";
    let params = [];

    if (search) {
      query += " AND (name LIKE ? OR license_number LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await db.query(query, params);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Nurses");

    worksheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Age", key: "age", width: 25 },
      { header: "DOB", key: "dob", width: 20 },
      { header: "License Number", key: "license_number", width: 25 },
    ];

    rows.forEach((row) => worksheet.addRow(row));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=nurses.xlsx");

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error creating Excel" });
  }
};
