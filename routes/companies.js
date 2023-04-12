const express = require("express"); 
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


router.get('/' , async (req, res, next) => {
    try{
    const results = await db.query(`SELECT * FROM companies`);
    // debugger;
    return res.json({companies: results.rows})}
    catch(e){
        return next(e);

    }
});


router.get('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const results = await db.query('SELECT * FROM companies WHERE code = $1', [code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find user with id of ${code}`, 404)
      }
      return res.send({ companies: results.rows[0] })
    } catch (e) {
      return next(e)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
 
        // const { code } = req.params;
      const {  code, name, description } = req.body;
      const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
    //   return res.status(201).json({company: results.rows[0]});
        return res.json({company: results.rows});
    } catch (e) {
      return next(e)
    }
  })

  router.patch('/detailed/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { name, description } = req.body;
      const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't update user with id of ${code}`, 404)
      }
      return res.send({ company: results.rows[0] })
    } catch (e) {
      return next(e)
    }
  })


  router.delete('/:code', async (req, res, next) => {
    try {
      const results = db.query('DELETE FROM companies WHERE code = $1', [req.params.code])
      return res.send({ msg: "DELETED!" })
    } catch (e) {
      return next(e)
    }
  })

  router.get("/detailed/:code", async function (req, res, next) {
    try {
      let code = req.params.code;
  
      const compResult = await db.query(
            `SELECT code, name, description
             FROM companies
             WHERE code = $1`,
          [code]
      );
  
      const invResult = await db.query(
            `SELECT id
             FROM invoices
             WHERE comp_code = $1`,
          [code]
      );
  
      if (compResult.rows.length === 0) {
        throw new ExpressError(`No such company: ${code}`, 404)
      }
  
      const company = compResult.rows[0];
      const invoices = invResult.rows;
  
      company.invoices = invoices.map(inv => inv.id);
  
      return res.json({"company": company});
    }
  
    catch (err) {
      return next(err);
    }
  });






module.exports = router ;