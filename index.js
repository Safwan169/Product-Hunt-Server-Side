const express = require('express');
const app = express();
const port = process.env.PROT || 5000;
require('dotenv').config()
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const cors = require('cors');
app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin: ["http://localhost:5174", "http://localhost:5173", "https://ass-12-834ed.web.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
  }

));


// Todo:incomplete

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  // console.log('token in the middleware', token);
  // no token available 
  if (!token) {
    // console.log("no")
    return res.status(401).send({ message: 'unauthorized access ' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
    // console.log("yesno")

      return res.status(401).send({ message: 'unauthorized access ' })
    }
    // console.log("yes")

    req.user = decoded;
    next();
  })
}


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
}


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
    // const data1 = database.collection("recommendationData");
    const add_Data = database.collection("add-product");
    const UserData = database.collection("UserData");
    const feturedData = database.collection("feturedData");
    const reportData = database.collection("reportData");
    const reviewData = database.collection("reviewData");
    const couponData = database.collection("couponData");


    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      // console.log('user for token', user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

      res.cookie('token', token,cookieOptions)
        .send({ success: true });
    })

    // when Logout user 
    app.post('/logout', async (req, res) => {
      const user = req.body;
      // console.log('logging out', user);
      res.clearCookie('token', {...cookieOptions, maxAge: 0 }).send({ success: true })
  })

 

// status Update By moderator
app.put('/status/:id', async (req, res) => {
  const id = req.params.id;
  const dd=req.body 
  // console.log('dasdta',dd.text,id)
  const filter = { _id: new ObjectId(id) }
  const options = { upsert: true };
  // const data = req.body;
  // console.log(data)

  const updateData = {
    $set: {
      status:  `${dd.text}`,
     
  }
  }

  const result = await add_Data.updateOne(filter, updateData, options);
  res.send(result);
})

    // User Data post
    app.post('/User/:email', async (req, res) => {
      const data = req.body
      console.log(data)
      const email=req.params.email
    //   console.log(data)
  const filter={email:email}
    const foundEmail = await UserData.findOne(filter);
    // console.log(foundEmail)
      if (foundEmail) {
        return
      }

      const result = await UserData.insertOne(data)
        res.send(result)
    // const foundEmailData = await UserData.findOne(filter);
    // res.send(foundEmail)

     
    })


    // user data get
    app.get('/User/:email',async(req,res)=>{
      // const data =req.body;
      const email =req.params.email
      const filter={email:email}
      const foundEmail= await UserData.findOne(filter)
      res.send(foundEmail)
    })

    //get user data 
    app.get('/user',async(req,res)=>{
      const cursor=UserData.find()
      const request=await cursor.toArray()
      res.send(request)
    })

    // user role changed
    app.put('/roleChanged/:id',async(req,res)=>{

      const id = req.params.id;
      const data=req.body
      // console.log(data)
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      // const data = req.body;
      // console.log(data)

      const updateData = {
        $set: {
          status:`${data.data}`
      }
      }

      const result = await UserData.updateOne(filter, updateData, options);
      res.send(result);
    })

    

    // fetured data
    app.post('/fetured', async (req, res) => {
      const data = req.body
      // const email=req.params.email
      .log(data)
  // const filter={email:email}
  //   const foundEmail = await UserData.findOne(filter);
  //   console.log(foundEmail)
  //     if (!foundEmail) {
        const result = await feturedData.insertOne(data)
        res.send(result)
  //     }
  //   // const foundEmailData = await UserData.findOne(filter);
  //   res.send(foundEmail)

     
    })

    // get featured data
    app.get('/fetured',async(req,res)=>{
      const cursor=feturedData.find();
      const request=await cursor.toArray()
      res.send(request)
    })

    // get all add data 
    app.get('/alldata', async (req, res) => {
      const cursor = add_Data.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    // get all add data  by tags
    app.post('/alldataTags', async (req, res) => {
      const data=req.body
    

    const key = 'text';
      const query = { [`tags.${key}`]: data.tag };


      const cursor = add_Data.find(query);
     

      if (data.tag) {
        const result = await cursor.toArray();
        // console.log(result)
       return res.send(result);        
       }
      const all = add_Data.find();

       const result = await all.toArray();

       res.send(result)
    })
    app.get('/alldata/:id', async (req, res) => {
      const id=req.params.id
      const filter = { _id: new ObjectId(id) }

      // const cursor = add_Data.findOne(filter);
      const result = await add_Data.findOne(filter);;
      // res.send(result);
    })

    // post  add data

    app.post('/add', async (req, res) => {
      const data = req.body
    //   console.log(data)
      const result = await add_Data.insertOne(data)
      res.send(result)
    })

    // report data

    app.post('/report',async(req,res)=>{
      const data=req.body
      // console.log(data)
      const result=await reportData.insertOne(data)
      res.send(result)
    })
    // reviews
    app.post('/rev',async(req,res)=>{
      const data=req.body
      // console.log(data)
      const result=await reviewData.insertOne(data)
      res.send(result)
    })
    app.get("/vvv",async(req,res)=>{
      // const id=req.params.id
      // const filter = { _id: new ObjectId(id) }

      // const cursor = add_Data.findOne(filter);
      const result = await reviewData.find().toArray();
      res.send(result)

    })

    // get report data
    app.get('/getReport',async(req,res)=>{
      const cursor=reportData.find()
      const request=await cursor.toArray()
      res.send(request)
    })

    // increment vote data
    app.put('/vote/:idd', async (req, res) => {
      const id = req.params.idd;
      // console.log(id)
      const data = req.body
      // console.log(JSON.stringify(data.email))

      // const filter = { _id: new ObjectId(id) }


      // const cursor = add_Data.find({ voteUser:email })
      // const userEmail = await cursor.toArray();

    //   var count =add_Data.countDocuments({ 
    //     "_id": id, 
    
    // });

    // console.log(count)

      // const options = {
      //   // Sort matched documents in descending order by rating
      //   // sort: { voteUser:`${JSON.stringify(data)}` },
      //   sort: { "voteUser":`${JSON.stringify(data)}` },
      //   // Include only the `title` and `imdb` fields in the returned document
      //   projection: { _id: 0, voteUser: 1 },
      // };
      const filter = { _id: new ObjectId(id) }
      const filter1 = { _id: id }


      const result = await add_Data.findOne(filter,);
      const featured = await feturedData.findOne(filter1,);
      // console.log('aita',result.voteUser)
      const uservote=((result?.voteUser)?.find(d=>d==data.email))
      const uservote1=((featured?.voteUser)?.find(d=>d==data.email))
      // console.log(uservote)


      const options = { upsert: true };
      // const data = req.body;
      // console.log('asdfsdf')

      const updateData = {
        $inc: { vote: 1 },
        $push:{"voteUser":data.email}
      }

      if (!uservote) {
    
  
        const result = await add_Data.updateOne(filter, updateData, options);
        res.send(result);
        if (featured && !uservote1) {
        const result2 = await feturedData.updateOne(filter1, updateData, options);

          
        }
      }
      else{res.send(" exist")}

  
    })
    // decrement vote data
    app.put('/voteDec/:idd', async (req, res) => {
      const id = req.params.idd;
      // console.log(id)
      const data = req.body
      // console.log(JSON.stringify(data.email))

      const filter = { _id: new ObjectId(id) }
      const filter1 = { _id: id }


      // const cursor = add_Data.find({ voteUser:email })
      // const userEmail = await cursor.toArray();

    //   var count =add_Data.countDocuments({ 
    //     "_id": id, 
    
    // });

    // console.log(count)

      // const options = {
      //   // Sort matched documents in descending order by rating
      //   // sort: { voteUser:`${JSON.stringify(data)}` },
      //   sort: { "voteUser":`${JSON.stringify(data)}` },
      //   // Include only the `title` and `imdb` fields in the returned document
      //   projection: { _id: 0, voteUser: 1 },
      // };

      const result = await add_Data.findOne(filter,);
      const result1 = await feturedData.findOne(filter1,);
      // console.log('aita',result.voteUser)
      const uservote=((result?.voteUser)?.find(d=>d==data.email))
      const uservote1=((result1?.voteUser)?.find(d=>d==data.email))
      // console.log(uservote)

      if (uservote ) {
        // const filter = { _id: new ObjectId(id) }
        const options = { upsert: true };
        // const data = req.body;
        // console.log('asdfsdf')
  
        const updateData = {
          $inc: { vote: -1 },
          $pull:{"voteUser":data.email}
        }
  
        const result = await add_Data.updateOne(filter, updateData, options);
        res.send(result);

        if (result1 && uservote1) {
        const result1 = await feturedData.updateOne(filter1, updateData, options);

          
        }
      }
      else{res.send(" exist")}

  
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
    app.get('/myData/:email',verifyToken, async (req, res) => {
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
    app.put('/update/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
      const data=req.body
      // console.log(id)
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
    app.delete('/delete/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
    //   console.log('asdf',id)
      const query = { _id: new ObjectId(id) }
      const result = await add_Data.deleteOne(query);
      res.send(result);
    })
    // delete reported  data form reported collection and alldata collection 
    app.delete('/reportdel/:id', async (req, res) => {
      const id = req.params.id;
    //   console.log('asdf',id)
      const query = { _id: new ObjectId(id) }
      const query2 = { id: id }
      const result = await add_Data.deleteOne(query);
      const result2 = await reportData.deleteOne(query2);
      res.send(result);
    })


    // coupons data post
    app.post('/coupon', async (req, res) => {
      const user = req.body
      const result = await couponData.insertOne(user)
      res.send(result)
    })
    // coupons data get
    app.get('/coupons', async (req, res) => {
      // const user = req.body
      const cursor =  couponData.find()
      const result=await cursor.toArray()
      res.send(result)
    })
    // delete coupons data
    app.delete('/deleteCoupons/:id',verifyToken, async (req, res) => {
      const id = req.params.id;
    //   console.log('asdf',id)
      const query = { _id: new ObjectId(id) }
      const result = await couponData.deleteOne(query);
      res.send(result);
    })
    app.put('/Updatecoupon/:id', async (req, res) => {
      const id = req.params.id;
      const data=req.body
      console.log('asdf',id,data)
      const query = { _id: new ObjectId(id) }
      const options = { upsert: true };


      const updateData = {
        $set: {
          code: data.code,
          amount: data.amount,
          date: data.date,
          description: data.description,
          // externalLinks: data.visitors,
          // location: data.location,
          // Country: data.Country,
          // description: data.description,
          // spot: data.spot
      }
      }  
          const result = await couponData.updateOne(query,updateData,options);
      res.send(result);
    })

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