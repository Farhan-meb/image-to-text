const { Router } = require("express");
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (res, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.post("/upload", upload.single("avatar"), (req, res) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
        if (err) return console.log(err);

        worker
            .recognize(data, "ben+eng", { tessjs_create_pdf: "1" })
            .progress((progress) => {
                console.log(progress);
            })
            .then((result) => {
                res.send(result.text);
            })
            .finally(() => worker.terminate());
    });
});

//listen port
const port = 4000 || process.env.PORT;
app.listen(port, () => {
    console.log("Server started on port", port);
});
