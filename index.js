const express = require('express');
const app = express();
const port = process.env.PROT || 5000;
require('dotenv').config()
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const cors = require('cors')
app.use(express.json());
// app.use(cookieParser());
app.use(cors(
  {
    origin: ["http://localhost:5174", "http://localhost:5173", "https://product-info-bd6b7.web.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // credentials: true
  }

));

// const verifyToken = (req, res, next) => {
//   const token = req?.cookies?.token;
//   console.log('token in the middleware', token);
//   // no token available 
//   if (!token) {
//     return res.status(401).send({ message: 'unauthorized access ' })
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: 'unauthorized access ' })
//     }
//     req.user = decoded;
//     next();
//   })
// }


// const cookieOptions = {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === "production",
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
// };


const uri = `mongodb+srv://${process.env.DATA_1}:${process.env.DATA_2}@cluster0.6zehkma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// console.log("sdf",process.env.DATA_1)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();



    const database = client.db("Product-Hunt");
    const add_Data = database.collection("add-product");
    // const data1 = database.collection("recommendationData");


    // auth related api
    // app.post('/jwt', async (req, res) => {
    //   const user = req.body;
    //   console.log('user for token', user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

    //   res.cookie('token', token,cookieOptions)
    //     .send({ success: true });
    // })

//     app.post('/logout', async (req, res) => {
//       const user = req.body;
//       console.log('logging out', user);
//       res.clearCookie('token', {...cookieOptions, maxAge: 0 }).send({ success: true })
//   })

    // get all add data 
    app.get('/alldata', async (req, res) => {
      const cursor = add_Data.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // post  add data

    app.post('/add', async (req, res) => {
      const data = req.body
    //   console.log(data)
      const result = await add_Data.insertOne(data)
      res.send(result)
    })

    // update queries data
    app.put('/vote/:idd', async (req, res) => {
      const id = req.params.idd;
      console.log(id)
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      // const data = req.body;
      // console.log(data)

      const updateData = {
        $inc: { vote: 1 }
      }

      const result = await add_Data.updateOne(filter, updateData, options);
      res.send(result);
    })

    // delete queries data
    // app.delete('/queries/:id', async (req, res) => {
    //   const id = req.params.id;
    //   // console.log(id)
    //   const query = { _id: new ObjectId(id) }
    //   const result = await data.deleteOne(query);
    //   res.send(result);
    // })


    // my add-data  
    app.get('/myData/:email', async (req, res) => {
        // const data=req.user
        // console.log('sdf',data.email)

    //   if (req.user.email !== req.params.email) {
    //     return res.status(403).send({ message: 'forbidden access' })
    //   }
    // //   let query = {};
    // //   if (req.user.email) {
    // //     query = { email: req.user.email }
    // //   }

      const email = req.params.email
      const cursor = add_Data.find({ email })
      const request = await cursor.toArray();
      res.send(request)

    })

    // my data update
    app.put('/update/:id', async (req, res) => {
      const id = req.params.id;
      const data=req.body
      console.log(id)
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      // const data = req.body;
      // console.log(data)

      const updateData = {
        $set: {
          productName: data.productName,
          productImage: data.productImage,
          description: data.description,
          tags: data.tags,
          externalLinks: data.visitors,
          // location: data.location,
          // Country: data.Country,
          // description: data.description,
          // spot: data.spot
      }
      }

      const result = await add_Data.updateOne(filter, updateData, options);
      res.send(result);
    })
    // decreasing  recommendation count
    // app.put('/delete/:idd', async (req, res) => {
    //   const id = req.params.idd;
    //   const filter = { _id: new ObjectId(id) }
    //   const options = { upsert: true };
    //   // const data = req.body;
    //   // console.log(data)
    //   // console.log(id,filter)

    //   const deleteData = {
    //     $inc: { recommendationCount: -1 }
    //   }

    //   const result = await data.updateOne(filter, deleteData, options);
    //   res.send(result);
    // })

    // delete my added data
    app.delete('/delete/:id', async (req, res) => {
      const id = req.params.id;
    //   console.log('asdf',id)
      const query = { _id: new ObjectId(id) }
      const result = await add_Data.deleteOne(query);
      res.send(result);
    })


    // recommendation data post
    // app.post('/rec', async (req, res) => {
    //   const user = req.body
    //   const result = await data1.insertOne(user)
    //   res.send(result)
    // })

    // recommendation data get 
    // app.get('/rec', async (req, res) => {
    //   const cursor = data1.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })

    // const movie = await movies.find();
    // console.log(movie)
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
;


app.get('/', (req, res) => {
  res.send('asdhfjsd')
})



app.listen(port, () => {
  console.log(`kaj hoisa ${port}`)
})