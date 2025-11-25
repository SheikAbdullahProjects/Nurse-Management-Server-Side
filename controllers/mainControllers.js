import { db } from "../config/db.js";
import ExcelJS from "exceljs";

export const getAllNurseData = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM nurse");
    res.status(200).json({ success: true, data: rows });
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
    const [rows] = await db.query("SELECT * FROM nurse");

    let csv = "id,name,license_number,dob,age\n";

    rows.forEach((row) => {
      csv += `${row.id},${row.name},${row.license_number},${row.dob},${row.age}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=nurses.csv");

    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "Error creating CSV" });
  }
};

export const exportNurseDataToExcel = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM nurse");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Nurses");

    sheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 25 },
      { header: "License Number", key: "license_number", width: 25 },
      { header: "DOB", key: "dob", width: 15 },
      { header: "Age", key: "age", width: 10 }
    ];

    rows.forEach((row) => sheet.addRow(row));

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=nurses.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: "Error creating Excel" });
  }
}
