import express from 'express';
import { createNurseData, DeleteNurseData, exportNurseDataToCSV, exportNurseDataToExcel, getAllNurseData, getSingleNurseData } from '../controllers/mainControllers.js';

const router = express.Router();

router.get("/", getAllNurseData);
router.get("/csv", exportNurseDataToCSV);
router.get("/excel", exportNurseDataToExcel);
router.get("/:id", getSingleNurseData);
router.post("/", createNurseData);
router.delete("/:id", DeleteNurseData);



export default router;