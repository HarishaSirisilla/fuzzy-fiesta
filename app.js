const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

module.exports = app;

app.use(express.json());

let dbPath = path.join(__dirname, "covid19India.db");

let db = null;

let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running successfully");
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/states", async (request, response) => {
  let sql_query = `
        SELECT
            state_id AS stateId, state_name AS stateName, population
        FROM state;`;
  let result1 = await db.all(sql_query);
  response.send(result1);
});

app.get("/states/:stateId", async (request, response) => {
  let { stateId } = request.params;
  let sql_query = `
        SELECT
            state_id AS stateId,
            state_name AS stateName,
            population
        FROM state
        WHERE state_id = ${stateId};`;
  let result2 = await db.get(sql_query);
  response.send(result2);
});

app.post("/districts", async (request, response) => {
  let { districtName, stateId, cases, cured, active, deaths } = request.body;
  let post_sql_query = `
        INSERT INTO district
            (district_name, state_id, cases, cured, active, deaths)
        VALUES ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  await db.run(post_sql_query);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId", async (request, response) => {
  let { districtId } = request.params;
  let sql_query = `
        SELECT
            district_id AS districtId,
            district_name AS districtName,
            state_id AS stateId,
            cases,
            cured,
            active,
            deaths
        FROM district
        WHERE district_id = ${districtId};`;
  let result = await db.get(sql_query);
  response.send(result);
});

app.delete("/districts/:districtId", async (request, response) => {
  let { districtId } = request.params;
  let delete_sql_query = `
        DELETE FROM district
        WHERE district_id = ${districtId};`;
  await db.run(delete_sql_query);
  response.send("District Removed");
});

app.put("/districts/:districtId", async (request, response) => {
  let { districtName, stateId, cases, cured, active, deaths } = request.body;
  let { districtId } = request.params;
  let update_sql_query = `
    UPDATE
        district
    SET 
        district_name = '${districtName}',
        state_id = ${stateId},
        cases = ${cases},
        cured = ${cured},
        active = ${active},
        deaths = ${deaths}
    WHERE
        district_id = ${districtId};`;
  await db.run(update_sql_query);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats", async (request, response) => {
  let { stateId } = request.params;
  let sql_query = `
        SELECT
            SUM(cases) AS totalCases,
            SUM(cured) AS totalCured,
            SUM(active) AS totalActive,
            SUM(deaths) AS totalDeaths
        FROM
            district
        WHERE
            state_id = ${stateId};`;
  let result = await db.get(sql_query);
  response.send(result);
});

app.get("/districts/:districtId/details", async (request, response) => {
  let { districtId } = request.params;
  let sql_query = `
        SELECT
            state_name AS stateName
        FROM
            state
            INNER JOIN
            district
            ON
            state.state_id = district.state_id
        WHERE
            district.district_id = ${districtId};`;
  let result = await db.get(sql_query);
  response.send(result);
});
