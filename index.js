import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import pug from "pug";

const cwd = process.cwd();
const viewPath = path.join(cwd, "view");

const menuItems = [
  { path: "/", title: "Home", isActive: true },
  { path: "/about-me", title: "About", isActive: false },
  { path: "/references", title: "References", isActive: false },
  { path: "/contact-me", title: "Contact", isActive: false },
];

const server = http.createServer((req, res) => {
  const url = req.url;

  // HOME
  if (url === "/" && req.method === "GET") {
    const html = pug.renderFile(path.join(viewPath, "home.pug"), {
      items: menuItems,
      toastMessage: null,
    });

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  // PAGE CONTACT
  if (url === "/contact-me" && req.method === "GET") {
    const html = pug.renderFile(path.join(viewPath, "contact.pug"), {
      items: menuItems,
      toastMessage: null,
    });

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
    return;
  }

  // FORM CONTACT
  if (url === "/contact-me" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      const params = new URLSearchParams(body);
      const email = params.get("email");
      const message = params.get("message");

      const contact = { email, message };

      const filePath = path.join(cwd, "contacts.json");
      let contacts = [];

      if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, "utf-8").trim();
        if (content === "") {
          fs.writeFileSync(filePath, "[]", "utf-8");
          content = "[]";
        }
        contacts = JSON.parse(content);
      } else {
        fs.writeFileSync(filePath, "[]", "utf-8");
      }

      contacts.push(contact);
      fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));

      const html = pug.renderFile(path.join(viewPath, "home.pug"), {
        items: menuItems,
        toastMessage: "Votre message a bien été envoyé !",
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
  console.log("Serveur en ligne sur http://localhost:3000");
});
