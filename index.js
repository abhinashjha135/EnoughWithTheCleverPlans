const express = require('express');
const app = express();
const cors = require('cors');
const ObjectId = require('mongodb');
require('./db/config')
const User = require("./db/User");
const Product = require("./db/Product")
app.use(express.json());
app.use(cors())
const jwt = require('jsonwebtoken');
const jwtKey = "e-commerceByAvinash"
app.get("/",verifyToken, async(req,resp)=>{
  console.log("dksjlkfjsdlk")
  try{
    const list=await Product.find();
    console.log("iske baad")
    resp.send(list);
  }catch(error){
      resp.send("error aa rhah ")
  }
        

})
app.get("/users",verifyToken,async(req,resp)=>{
  try{
 const users=await User.find();
   resp.send(users);
  }catch(error){
   resp.send("galat connect ho gya");
  }
})
function verifyToken(req,resp,next){
  //  let token=req.headers['authorization'];

  //  if(token){
  //   console.log(token);
  //   token=token.split(' ')[1];
  //     jwt.verify(token,jwtKey,(err,valid)=>{
  //       if(err){
  //         console.log("error mei h")
  //         resp.status(401).send({result:"please provide correct token"});
  //       }
  //       else{
  //         console.log("next mei h ")
  //        next();
  //       }
  //     })
  //  }
  //  else{
  //   resp.status(403).send({result:"please add token for authorization"})
  //  }
  next();
}

app.post("/product",async (req,resp)=>{

        let product=new Product(req.body);
        let result=await product.save();
        result=result.toObject();
        delete result.password;
        resp.send(result)

})
app.post("/register", async (req,resp)=>{
  let user=new User(req.body);
  user=await user.save();
  jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
    if(err){
      resp.send({result:"no user found"});
    }
    resp.send({user,auth:token});

  })

})
app.post("/login",async (req,resp)=>{

  try{
    let user=await User.findOne(req.body).select("-password");
    if(user){
      jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
        if(err){
          resp.send({result:"no user found"});
        }
        resp.send({user,auth:token});

      })
    //  resp.send(user);
    }
    else{
       resp.send({result:"no user found"});
    }
  } catch(error){
    res.status(500).json({ error: 'Internal server error' });
  }

})
app.get("/search/:productId", async (req, res) => {
        console.log("avinash")
        const productId = req.params.productId;
      console.log(productId)
        try {
          const product = await Product.findOne({ _id: productId});

          if (product) {
            res.json(product);
          } else {
            res.status(404).json({ error: 'Product not found' });
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });

app.put("/update/:productId",async (req,resp)=>{
        console.log("update this");
        const productId=req.params.productId;
        try{

         const key={_id:productId}; // iscondition pe update karna h 
         const update={$set:req.body}; // aur ye update karna h 
         const result=await Product.updateOne(key,update);
         if(result&&result.modifiedCount>0){
          resp.status(200).json({ message: 'Document updated successfully' });
         }
         else{
          resp.status(404).json({ message: 'Document not found' });
         }

        } catch(error){
          console.error('Error fetching product:', error);
          resp.status(500).json({ error: 'Internal server error' });
        }
})
app.delete("/delete/:productId",async(req,resp)=>{
    console.log("Delte this");
    try{
      const result=await Product.deleteOne({_id:req.params.productId});
      if(result){
        resp.status(200).json({message:'document deleted'});
      }
      else{
        resp.status(404).json({message:"document not found"});
      }

    }catch(error){
      resp.status(500).json({error:"internal server error"});
    }

});
app.get("/searchByTyping/:key",async(req,resp)=>{
      const key=req.params.key;
      let result=await Product.find({
        "$or":[
             {name:{$regex:key}},
             {brand:{$regex:key}}
        ]
      });
      resp.send(result);
})
app.listen(5000)

// const axios = require('axios');
// const cheerio = require('cheerio');
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// const url = 'https://www.timeanddate.com/holidays/india/2024';

// async function fetchHtml(url) {
//   try {
//     const response = await axios.get(url, {
//       headers: {
//         'Content-Type': 'text/html; charset=UTF-8',
//         'Accept-Language': 'en-US'
//       }
//     });


//     return response.data;
//   } catch (error) {
//     throw new Error(`Error fetching HTML from ${url}: ${error.message}`);
//   }
// }

// function extractTableData(html) {
//   const $ = cheerio.load(html);
//   const tableRows = $('table tr');

//   const tableData = [];

//   tableRows.each((index, row) => {
//     const columns = $(row).find('td, th');
//     const rowData = [];
//     let hrefContent = '';
//     columns.each((colIndex, column) => {

//       let anchoreElement = $(column).find('a');
//       if (anchoreElement.length > 0) {
//         hrefContent = 'https://www.timeanddate.com'
//         hrefContent += anchoreElement.attr('href');

//       }
//       rowData.push($(column).text().trim());
//     });

//     if (rowData.length > 0&&hrefContent!='') {
//       rowData.push(hrefContent)
//     }
//     tableData.push(rowData);
//   });
//   return tableData;

// }

// function writeToCsv(data, csvFilePath) {
//   if (data.length === 0) {
//     console.error('No data to write to CSV.');
//     return;
//   }
//   data[0].push('url');
//   data[0].push('Holiday year');
//   data[0].push('country');
//   data[0].push('url1');
//   data[0].push('url2');
//   data[0].push('Region');
//   data[0].push('Importance');
//   data[0].push('Description');
//   data[0].push('ImpactID')

//   const csvWriter = createCsvWriter({
//     path: csvFilePath,
//     header: data[0].map((_, index) => ({ id: `column${index + 1}` })),
//   });

//   const records = data.map(row => row.reduce((acc, value, index) => {

//     acc[`column${index + 1}`] = value;
//     return acc;
//   }, {}));
//   // console.log(records)
//   return csvWriter.writeRecords(records);
// }
// async function main() {
//   try {
//     let countryArray = ['india', 'singapore']
//     let yeararray = [2023, 2024, 2025];
//     let mainTable = [];
//     for (let y = 0; y < 2; y++) {
//       for (let i = 0; i < 3; i++) {
//         let url = `https://www.timeanddate.com/holidays/${countryArray[y]}/${yeararray[i]}`;
//         const html = await fetchHtml(url);
//         const tableData = extractTableData(html);
//         for (let j = 0; j < tableData.length; j++) {

//           if (tableData[j].length != 0) {

//             if (j != 0) {
//               tableData[j].push(yeararray[i]);
//               tableData[j].push(countryArray[y]);
//               tableData[j].push(`https://www.timeanddate.com/holidays/${countryArray[y]}`)
//               tableData[j].push(`https://www.timeanddate.com/holidays/${countryArray[y]}/${yeararray[i]}`)
//               tableData[j].push(null);
//               tableData[j].push('N/a');
//               tableData[j].push(null);
//               tableData[j].push(5);
//               // tableData[j].push(url);
//             }

//             if (j == 0) {
//               if (y == 0 && i == 0) {
//                 mainTable.push(tableData[j]);
//               }
//             }
//             else {
//               mainTable.push(tableData[j]);
//             }


//           }

//         }
//       }
//     }



//     if (mainTable.length === 0) {
//       console.error('No table data found');
//       return;
//     }

//     const csvFilePath = 'output.csv';
//     await writeToCsv(mainTable, csvFilePath);

//     console.log(`CSV file created successfully at: ${csvFilePath}`);
//   } catch (error) {
//     console.error(error.message);
//   }
// }

// main();
