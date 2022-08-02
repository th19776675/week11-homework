const express = require("express");
const path = require("path");
const fs = require("fs");

const uuid = require("./helpers/uuid");

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/notes", (req, res) => 
  res.sendFile(path.join(__dirname, "/public/notes.html"))
)

app.get("/api/notes", (req, res) => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "/db/db.json")));
  res.json(data)
})

app.post("/api/notes", (req,res) => {
  console.info(`${req.method} request received to add a note`);
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    }

    fs.readFile(path.join(__dirname, "/db/db.json"), 'utf8', function (err, data) {
      if (err) {
        console.error(err);
      } else {
        const notesData = JSON.parse(data);
        notesData.push(newNote);
        fs.writeFile(
          path.join(__dirname, "/db/db.json"),
          JSON.stringify(notesData),
          (writeErr) =>
            writeErr
              ? console.error(writeErr)
              : console.info('Successfully added note!')
        )
      }
    });
    const response = {
      status: 'success',
      body: newNote,
    };
  
    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting review');
  }
})

app.delete("/api/notes/:id", (req, res) => {
  fs.readFile(path.join(__dirname, "/db/db.json"), 'utf8', function (err, data) {
    if (err) {
      console.error(err);
    } else {
      const notesData = JSON.parse(data);
      let updatedData = notesData.filter((r) => r.id !== req.params.id)
      fs.writeFile(
        path.join(__dirname, "/db/db.json"),
        JSON.stringify(updatedData),
        (writeErr) =>
          writeErr
            ? console.error(writeErr)
            : console.info('Successfully deleted note!')
      )
    }
  });
})

app.get("*", (req, res) => 
  res.sendFile(path.join(__dirname, "/public/index.html"))
)



app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);