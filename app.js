const jwt = require("jsonwebtoken")
const express = require("express")
const cors=require("cors");
const req = require("express/lib/request");

const app = express();

app.use(express.json())

const corsOptions ={
      origin:'*', 
      credentials:true,            //access-control-allow-credentials:true
      optionSuccessStatus:200,
}

app.use(cors(corsOptions))

var connection = mysql.createConnection({
    host     : process.env.RDS_HOSTNAME,
    user     : process.env.RDS_USERNAME,
    password : process.env.RDS_PASSWORD,
    port     : process.env.RDS_PORT,
    database  : "IDC"
})

connection.connect(err=>{
    if(err)
        console.log(err)
    else{
        console.log("Connected to IDC database...");
        const sql = "CREATE TABLE IF NOT EXISTS admin(id varchar(50) NOT NULL UNIQUE, password varchar(50) NOT NULL);";
        connection.query(sql,(err,result)=>{
            if(err)
                console.log(err)
            else
                console.log("Admin table created or it already exists!!!");
        })
    }
})

const getUserDetails = () => {
    const SQL = `SELECT * FROM users;`;
    return new Promise((resolve,reject)=>{
        connection.query(SQL, (err,result)=>{
            if(err)
                return reject(err)
            return resolve(result)
        })
    })
}
  
const getLabtechDetails = () => {
    const SQL = `SELECT * FROM labtech;`;
    return new Promise((resolve,reject)=>{
        connection.query(SQL, (err,result)=>{
            if(err)
                return reject(err)
            return resolve(result)
        })
    })
}
  
const getDoctorDetails = () => {
    const SQL = `SELECT * FROM doctor;`;
    return new Promise((resolve,reject)=>{
        connection.query(SQL, (err,result)=>{
            if(err)
                return reject(err)
            return resolve(result)
        })
    })
}

const getAdminDetails = (id) => {
    let sql = `SELECT * FROM admin`;
    sql += (id === undefined) ? `` : `WHERE id=${id};`;
    return new Promise((resolve,reject)=>{
        connection.query(sql,(err,result)=>{
            if(err)
                return reject(err)
            return resolve(result)
        })
    })
}
app.get("/doctorlist",async (req,res)=>{
    const doctorlist = await getDoctorDetails();
    res.send({list:doctorlist})
});

app.get("/userlist", async (Req,res)=>{
    const userlist = await getUserDetails();
    res.send({list:userlist})
});

app.get("/labtechlist",async(req,res)=>{
    const labtechlist = await getLabtechDetails();
    res.send({list:labtechlist})
});

app.get("/counts",async(req,res)=>{
    let labtechLogins,usersRegistered,doctorLogins,labtechsRegistered,userLogins,doctorsRegistered;
})

app.post("/doctor",async(req,res)=>{
    const {id,mobile, name, password} = req.body
    if((name===undefined || name === "")&&(mobile===undefined || mobile.length===10)&&(password===undefined||password==="")&&(blocked!=="yes"||blocked!=="no"))
        res.send({"message":"Nothing to update"})
    else{
            if(name!==undefined && name !== ""){
                const update_sql=`UPDATE TABLE doctor SET name="${name}" WHERE id="${id}";`;
                connection.query(update_sql,(err,result)=>{
                    if(err){
                        console.log(err);
                        res.status(400);
                        res.send({"message":"Update Failed!"});
                    }
                    else{
                        res.send({"message":"Update successfull!!!"})
                    }
                })
            }
            if(mobile!==undefined&&mobile.length===10)
            {
                const update_sql=`UPDATE TABLE doctor SET name="${name}" WHERE id="${id}";`;
                connection.query(update_sql,(err,result)=>{
                    if(err){
                        console.log(err);
                        res.status(400);
                        res.send({"message":"Update Failed!"});
                    }
                    else{
                        res.send({"message":"Update successfull!!!"})
                    }
                })
            }
            if(password!==undefined && password!=="")
            {
                const update_sql=`UPDATE TABLE doctor SET \`password\`="${password}" WHERE id="${id}";`;
                connection.query(update_sql,(err,result)=>{
                    if(err){
                        console.log(err);
                        res.status(400);
                        res.send({"message":"Update Failed!"});
                    }
                    else{
                        res.send({"message":"Update successfull!!!"})
                    }
                })
            }
            if(blocked===true||blocked===false)
            {
                const update_sql=`UPDATE TABLE doctor SET blocked="${blocked}" WHERE id="${id}";`;
                connection.query(update_sql,(err,result)=>{
                    if(err){
                        console.log(err);
                        res.status(400);
                        res.send({"message":"Update Failed!"});
                    }
                    else{
                        res.send({"message":"Update successfull!!!"})
                    }
                })
            }
    }
})

app.post("/user",async(req,res)=>{
    const {id,mobile, name, password} = req.body
    if((name===undefined||name==="" )&&(mobile===undefined||mobile.length!==10)&&(password===undefined||password==="")&&(blocked!=="yes"||blocked!=="no"))
        res.send({"message":"nothing to update"})
    else{
        if(name!==undefined && name !== ""){
            const update_sql=`UPDATE TABLE users SET name="${name}" WHERE id="${id}";`;
            connection.query(update_sql,(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(400);
                    res.send({"message":"Update Failed!"});
                }
                else{
                    res.send({"message":"Update successfull!!!"})
                }
            })
        }
        if(mobile !== undefined && mobile.lenth===10){
            const update_sql=`UPDATE TABLE users SET mobile="${mobile}" WHERE id="${id}";`;
            connection.query(update_sql,(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(400);
                    res.send({"message":"Update Failed!"});
                }
                else{
                    res.send({"message":"Update successfull!!!"})
                }
            })
        }
        if(password !== undefined && password!==""){
            const update_sql=`UPDATE TABLE users SET \`password\`="${password}" WHERE id="${id}";`;
            connection.query(update_sql,(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(400);
                    res.send({"message":"Update Failed!"});
                }
                else{
                    res.send({"message":"Update successfull!!!"})
                }
            })
        }
        if(blocked===true||blocked===false){
            const update_sql=`UPDATE TABLE users SET blocked="${blocked}" WHERE id="${id}";`;
            connection.query(update_sql,(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(400);
                    res.send({"message":"Update Failed!"});
                }
                else{
                    res.send({"message":"Update successfull!!!"})
                }
            })
        }
    }
})

app.post("/labtech",async(req,res)=>{
    const {id,mobile, name, password,blocked} = req.body
    if((name===undefined || name === "")&&(mobile===undefined || mobile.length===10)&&(password===undefined||password==="")&&(blocked!=="yes"||blocked!=="no"))
        res.send({"message":"Nothing to update!!!"})
    else{
        if(name!==undefined && name !== ""){
            const update_sql=`UPDATE TABLE labtech SET name="${name}" WHERE id="${id}";`;
            connection.query(update_sql,(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(400);
                    res.send({"message":"Update Failed!"});
                }
                else{
                    res.send({"message":"Update successfull!!!"})
                }
            })
        }
        if(mobile !== undefined && mobile.lenth===10){
            const update_sql=`UPDATE TABLE users SET mobile="${mobile}" WHERE id="${id}";`;
            connection.query(update_sql,(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(400);
                    res.send({"message":"Update Failed!"});
                }
                else{
                    res.send({"message":"Update successfull!!!"})
                }
            })
        }
        if(password !== undefined && password!==""){
            const update_sql=`UPDATE TABLE users SET \`password\`="${name}" WHERE id="${id}";`;
            connection.query(update_sql,(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(400);
                    res.send({"message":"Update Failed!"});
                }
                else{
                    res.send({"message":"Update successfull!!!"})
                }
            })
        }
        if(blocked===true||blocked===false){
            const update_sql=`UPDATE TABLE users SET blocked="${blocked}" WHERE id="${id}";`;
            connection.query(update_sql,(err,result)=>{
                if(err){
                    console.log(err);
                    res.status(400);
                    res.send({"message":"Update Failed!"});
                }
                else{
                    res.send({"message":"Update successfull!!!"})
                }
            })
        }
    }
})

app.post("/login",async(req,res)=>{
  const {ID,password} = req.body;
  const adminDetails = await getAdminDetails(ID);
  const adminDetail = adminDetails[0];
  if(adminDetail === undefined){
    res.status(400);
    res.send({"error":"Invalid user"});
  }
  else if(adminDetail.password === password){
    const jwttoken = jwt.sign({ID},"SUITS_ADMIN");
    res.status(200)
    res.send({"jwt_token":jwttoken});
  }
  else{
    res.status(400);
    res.send({"error":"Invalid Password"});
  }
})

app.delete("/user",async(req,res)=>{
    const {memberid} = req.body;
    const sql = `DELETE FROM users WHERE memberid="${memberid}";`;
    connection.query(sql,(err,result)=>{
        if(err){
            console.log(err);
            res.status(400);
            res.send({"message":"Error deleting user"})
        }
        else{
            res.send({"message":"Delete success"})
        }
    })
})

app.delete("/doctor",async(req,res)=>{
    const {mobile} = req.body;
    const sql = `DELETE FROM doctor WHERE mobile="${mobile}";`;
    connection.query(sql,(err,result)=>{
        if(err){
            console.log(err);
            res.status(400);
            res.send({"message":"Error deleting doctor"})
        }
        else{
            res.send({"message":"Delete success"})
        }
    })
})

app.delete("/labtech",async(req,res)=>{
    const {mobile} = req.body;
    const sql = `DELETE FROM labtech WHERE memberid="${mobile}";`;
    connection.query(sql,(err,result)=>{
        if(err){
            console.log(err);
            res.status(400);
            res.send({"message":"Error deleting lab technician"})
        }
        else{
            res.send({"message":"Delete success"})
        }
    })
})

const port = process.env.PORT || 3010;
app.listen(port,()=>{console.log("Listening to port 3010!")}); 
