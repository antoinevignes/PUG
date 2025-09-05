import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import pug from "pug";
import dotenv from "dotenv";
import { formatDate, reverseFormat } from "./utils/utils.js";
import dayjs from "dayjs";
dotenv.config();

const host = process.env.APP_HOST;
const port = process.env.APP_PORT;

const cwd = process.cwd();
const viewPath = path.join(cwd, "views");
const dataPath = path.join(cwd, "data", "students.json");
const cssPath = path.join(cwd, "assets/css", "style.css");

let students = [];
if (fs.existsSync(dataPath)) {
  const content = fs.readFileSync(dataPath, "utf-8").trim();
  students = content ? JSON.parse(content) : [];
}

const server = http.createServer((req, res) => {
  const url = req.url;

  // CSS
  if (url === "/style.css") {
    fs.readFile(cssPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/css" });
      res.end(data);
    });
    return;
  }

  // HOME
  if (url === "/" && req.method === "GET") {
    const html = pug.renderFile(path.join(viewPath, "home.pug"), {
      toastMessage: null,
    });

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  // FORM AJOUT
  if (url === "/add-student" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const params = new URLSearchParams(body);
      const name = params.get("name");
      const birth = params.get("birth");
      const formattedBirth = reverseFormat(birth);

      const student = { name, birth: formattedBirth };

      students.push(student);

      fs.writeFile(dataPath, JSON.stringify(students, null, 2), (err) => {
        if (err) console.error(err);
      });

      const html = pug.renderFile(path.join(viewPath, "home.pug"), {
        toastMessage: "Votre étudiant a bien été ajouté !",
      });

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
    return;
  }

  // PAGE ETUDIANTS
  if (url === "/students" && req.method === "GET") {
    const html = pug.renderFile(path.join(viewPath, "studentList.pug"), {
      students: students,
      formatDate,
      toastMessage: null,
    });

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  // PAGE MODIFIER ETUDIANT
  if (url.startsWith("/edit-student") && req.method === "GET") {
    const query = new URL(req.url, `http://${host}:${port}`).searchParams;
    const index = parseInt(query.get("index"), 10);

    if (Number.isInteger(index) && index >= 0 && index < students.length) {
      const student = students[index];
      const birthForInput = dayjs(student.birth, "YYYY-DD-MM").format(
        "YYYY-MM-DD"
      );

      const html = pug.renderFile(path.join(viewPath, "editStudent.pug"), {
        student,
        birth: birthForInput,
        index,
        toastMessage: null,
      });

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
      return;
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Étudiant introuvable");
      return;
    }
  }

  // FORM MODIFIER ETUDIANT
  if (url === "/edit-student" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const index = parseInt(params.get("index"), 10);
      const name = params.get("name");
      const birth = reverseFormat(params.get("birth"));

      if (Number.isInteger(index) && index >= 0 && index < students.length) {
        students[index].name = name;
        students[index].birth = birth;

        fs.writeFile(dataPath, JSON.stringify(students, null, 2), (err) => {
          if (err) console.error(err);
        });
      }

      const html = pug.renderFile(path.join(viewPath, "studentList.pug"), {
        students,
        formatDate,
        toastMessage: "Étudiant modifié avec succès !",
      });

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
    return;
  }

  // SUPPRIMER ETUDIANT
  if (url === "/delete-student" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const params = new URLSearchParams(body);
      const index = parseInt(params.get("index"), 10);

      if (Number.isInteger(index) && index >= 0 && index < students.length) {
        students.splice(index, 1);

        const filePath = path.join(cwd, "data", "students.json");
        fs.writeFile(filePath, JSON.stringify(students, null, 2), (err) => {
          if (err) console.error(err);
        });
      }

      const html = pug.renderFile(path.join(viewPath, "studentList.pug"), {
        students,
        formatDate,
        toastMessage: "Étudiant supprimé avec succès !",
      });

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
    });
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

server.listen(3000, () => {
  console.log(`Serveur en ligne sur http://${host}:${port}`);
});
