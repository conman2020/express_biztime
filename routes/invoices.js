const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");


router.get('/' , async (req, res, next) => {
    try{
    const results = await db.query(`SELECT * FROM invoices`);
    // debugger;
    return res.json({invoices: results.rows})}
    catch(e){
        return next(e);

    }
});

router.get('/:id' , async (req, res, next) => {
    try{
        const {id} = req.params;
    const results = await db.query(`SELECT * FROM invoices WHERE id = $1`, [id]);
    // debugger;
    return res.send({ invoices: results.rows[0] })}
    catch(e){
        return next(e);

    }
});


router.post('/', async (req, res, next) => {
    try {
 
        // const { code } = req.params;
      const {  comp_code , amt } = req.body;
      const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
    //   return res.status(201).json({company: results.rows[0]});
        return res.json({company: results.rows});
    } catch (e) {
      return next(e)
    }
  })


  router.patch('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { amt } = req.body;
      const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't update user with id of ${id}`, 404)
      }
      return res.send({ invoice: results.rows[0] })
    } catch (e) {
      return next(e)
    }

  })


  router.delete('/:id', async (req, res, next) => {
    try {
      const results = db.query('DELETE FROM invoices WHERE id = $1', [req.params.id])
      return res.send({ msg: "DELETED!" })
    } catch (e) {
      return next(e)
    }
  })


  router.get('/:comp_code' , async (req, res, next) => {
    try {

      const companyResults = await db.query('SELECT code, name, description FROM companies WHERE code = $1', [req.params.comp_code]);
      console.log('compresults:', companyResults); //
      if (companyResults.rows.length === 0) {
        throw new ExpressError(`Company with code ${req.params.comp_code} not found`, 404);
      }
  
      const invoiceResults = await db.query('SELECT id FROM invoices WHERE comp_code = $1', [req.params.comp_code]);
      const invoices = invoiceResults.rows.map(row => row.id);
  
      const company = {
        code: companyResults.rows[0].code,
        name: companyResults.rows[0].name,
        description: companyResults.rows[0].description,
        invoices: invoices
      }
  
      return res.json({ company });
    } catch (e) {
      return next(e);
    }
  });

  router.get("/detailed/:id", async function (req, res, next) {
    try {
      let id = req.params.id;
  
      const result = await db.query(
            `SELECT i.id, 
                    i.comp_code, 
                    i.amt, 
                    i.paid, 
                    i.add_date, 
                    i.paid_date, 
                    c.name, 
                    c.description 
             FROM invoices AS i
               INNER JOIN companies AS c ON (i.comp_code = c.code)  
             WHERE id = $1`,
          [id]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`No such invoice: ${id}`,404);
      }
  
      const data = result.rows[0];
      const invoice = {
        id: data.id,
        company: {
          code: data.comp_code,
          name: data.name,
          description: data.description,
        },
        amt: data.amt,
        paid: data.paid,
        add_date: data.add_date,
        paid_date: data.paid_date,
      };
  
      return res.json({"invoice": invoice});
    }
  
    catch (err) {
      return next(err);
    }
  });
module.exports = router ;