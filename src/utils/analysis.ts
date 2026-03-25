import fs from "fs";
import  path from "path";
import puppeteer from "puppeteer";
import { cloudinaryInstance } from "../config/cloudinary.config";
import Handlebars from "handlebars"
import streamifier from "streamifier";

export const generateReport = async (data, templateCodes) => {
  try {
    // 1. Compile template
    const template = Handlebars.compile(templateCodes);
    const finalHtml = template({ data });

    // 2. Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "networkidle0" });

    // 3. Generate PDF buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // 4. Upload buffer using stream
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinaryInstance.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "blitz-analyzer/reports",
          public_id: `analysis_${data.id}_report`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      streamifier.createReadStream(pdfBuffer).pipe(stream);
    });

    console.log("PDF uploaded:", uploadResult.secure_url);

    return uploadResult.secure_url;
  } catch (error) {
    console.error("PDF generation/upload error:", error);
    throw error;
  }
};