require('dotenv').config();

const jwt = require("jsonwebtoken")
const express = require("express")
const cors=require("cors");
const mysql = require("mysql");
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
        const sql = "CREATE TABLE IF NOT EXISTS admin(id varchar(50) PRIMARY KEY, password varchar(50) NOT NULL);";
        connection.query(sql,(err,result)=>{
            if(err)
                console.log(err)
            else
                console.log("Admin table created or it already exists!!!");
        });
        const counts_sql = "CREATE TABLE IF NOT EXISTS counts (userLogins int(15), doctorLogins INT(15), labtechLogins INT(15));";
        connection.query(counts_sql,(err,result)=>{
            if(err)
                console.log(err)
            else
                console.log("Counts table created ot it already exists!!!");
        });
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
    let sql = `SELECT * FROM admin `;
    sql += (id === undefined) ? `` : `WHERE id="${id}";`;
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
    const sql = "SELECT * FROM counts;";
    connection.query(sql,(err,result)=>{
        console.log(result)
        if(err)
            console.log(err);
        else{
            userLogins = result[0].userLogins;
            doctorLogins = result[0].doctorLogins;
            labtechLogins = result[0].labtechLogins;
        }
    });
    const usersRegisteredsql = "SELECT COUNT(memberid) as usersRegistered FROM users;";
    connection.query(usersRegisteredsql,(err,result)=>{
        if(err)
            console.log(err)
        else{
            usersRegistered = result[0].usersRegistered;
        }
    });
    const labtechregisteredsql = "SELECT COUNT(mobile) as labtechsRegistered FROM labtech;";
    connection.query(labtechregisteredsql,(err,result)=>{
        if(err)
            console.log(err)
        else{
            labtechsRegistered = result[0].labtechsRegistered;
        }
    });
    const doctorsRegisteredsql = "SELECT COUNT(mobile) as doctorsRegistered FROM doctor;";
    connection.query(doctorsRegisteredsql,(err,result)=>{
        if(err)
            console.log(err)
        else{
            doctorsRegistered = result[0].doctorsRegistered;
        }
        res.send({labtechLogins,usersRegistered,doctorLogins,labtechsRegistered,userLogins,doctorsRegistered});
    });
})

app.post("/doctor",async(req,res)=>{
    const {id,mobile, name, password} = req.body
    let {blocked} = req.body;
    if(blocked)
        blocked = blocked.toUpperCase();
    if((name===undefined || name === "")&&(mobile===undefined || mobile.length===10)&&(password===undefined||password==="")&&(blocked!=="YES"||blocked!=="NO"))
        res.send({"message":"Nothing to update"})
        else{
            const sql = `update doctor set blocked = "${blocked}", name="${name}",password="${password}",mobile="${mobile}" WHERE id=${id};`;
            connection.query(sql,(err,result)=>{
                if(err)
                    console.log(err)
                res.send({"message":"Update successfull!!!"})
            })
        }
    // else{
    //         if(name!==undefined && name !== ""){
    //             const update_sql=`UPDATE doctor SET name="${name}" WHERE id="${id}";`;
    //             connection.query(update_sql,(err,result)=>{
    //                 if(err){
    //                     console.log(err);
    //                     res.status(400);
    //                     res.send({"message":"Update Failed!"});
    //                 }
    //                 else
    //                     res.send({"message":"Update successfull!!!"})
    //             })
    //         }
    //         if(mobile!==undefined && mobile.length===10)
    //         {
    //             const update_sql=`UPDATE doctor SET mobile="${mobile}" WHERE id="${id}";`;
    //             connection.query(update_sql,(err,result)=>{
    //                 if(err){
    //                     console.log(err);
    //                     res.status(400);
    //                     res.send({"message":"Update Failed!"});
    //                 }
    //                 else
    //                     res.send({"message":"Update successfull!!!"})
    //             })
    //         }
    //         if(password!==undefined && password!=="")
    //         {
    //             const update_sql=`UPDATE doctor SET \`password\`="${password}" WHERE id="${id}";`;
    //             connection.query(update_sql,(err,result)=>{
    //                 if(err){
    //                     console.log(err);
    //                     res.status(400);
    //                     res.send({"message":"Update Failed!"});
    //                 }
    //                 else{
    //                     res.send({"message":"Update successfull!!!"})
    //                 }
    //             })
    //         }
    //         if(blocked==="YES"||blocked==="NO")
    //         {
    //             const update_sql=`UPDATE doctor SET blocked="${blocked}" WHERE id="${id}";`;
    //             connection.query(update_sql,(err,result)=>{
    //                 if(err){
    //                     console.log(err);
    //                     res.status(400);
    //                     res.send({"message":"Update Failed!"});
    //                 }
    //                 else{
    //                     res.send({"message":"Update successfull!!!"})
    //                 }
    //             })
    //         }
    // }
})

app.post("/user",async(req,res)=>{
    const {id,memberid, name, password,mobile} = req.body
    let {blocked} = req.body;
    if(blocked)
        blocked = blocked.toUpperCase();
    if((name===undefined||name==="" )&&(mobile===undefined||mobile.length!==10)&&(password===undefined||password==="")&&(blocked!=="YES"||blocked!=="NO"))
        res.send({"message":"nothing to update"})
    else{
        const sql = `update users set blocked = "${blocked}", name="${name}",password="${password}",mobile="${mobile}" WHERE id=${id};`;
        connection.query(sql,(err,result)=>{
            if(err)
                console.log(err)
            res.send({"message":"Update successfull!!!"})
        })
    }
    // else{
    //     if(name!==undefined && name !== ""){
    //         const update_sql=`UPDATE users SET name="${name}" WHERE id="${id}";`;
    //         connection.query(update_sql,(err,result)=>{
    //             if(err){
    //                 console.log(err);
    //                 res.status(400);
    //                 res.send({"message":"Update name Failed!"});
    //             }
    //             else{
    //                 res.send({"message":"Update name successfull!!!"})
    //             }
    //         })
    //     }
    //     if(mobile !== undefined && mobile.length === 10){
    //         const update_sql=`UPDATE users SET mobile="${mobile}" WHERE id="${id}";`;
    //         connection.query(update_sql,(err,result)=>{
    //             if(err){
    //                 console.log(err);
    //                 res.status(400);
    //                 res.send({"message":"Update mobile Failed!"});
    //             }
    //             else
    //                 res.send({"message":"Update successfull!!!"})
    //         })
    //     }
    //     if(password !== undefined && password!==""){
    //         const update_sql=`UPDATE users SET \`password\`="${password}" WHERE id="${id}";`;
    //         connection.query(update_sql,(err,result)=>{
    //             if(err){
    //                 console.log(err);
    //                 res.status(400);
    //                 res.send({"message":"Update Failed!"});
    //             }
    //             else{
    //                 res.send({"message":"Update password successfull!!!"})
    //             }
    //         })
    //     }
    //     if(blocked==="YES"||blocked==="NO"){
    //         const update_sql=`UPDATE users SET blocked="${blocked}" WHERE id="${id}";`;
    //         connection.query(update_sql,(err,result)=>{
    //             if(err){
    //                 console.log(err);
    //                 res.status(400);
    //                 res.send({"message":"Update Failed!"});
    //             }
    //             else{
    //                 res.send({"message":"Update blocked successfull!!!"})
    //             }
    //         })
    //     }
    // }
})

app.post("/labtech",async(req,res)=>{
    const {id,mobile, name, password} = req.body
    let {blocked} = req.body;
    if(blocked)
        blocked = blocked.toUpperCase();
    if((name===undefined || name === "")&&(mobile===undefined || mobile.length===10)&&(password===undefined||password==="")&&(blocked!=="YES"||blocked!=="NO"))
        res.send({"message":"Nothing to update!!!"})
    else{
        const sql = `update labtech set blocked = "${blocked}", name="${name}",password="${password}",mobile="${mobile}" WHERE id=${id};`;
        connection.query(sql,(err,result)=>{
            if(err)
                console.log(err)
            res.send({"message":"Update successfull!!!"})
        })
    }
    // else{
    //     if(name!==undefined && name !== ""){
    //         const update_sql=`UPDATE labtech SET name="${name}" WHERE id="${id}";`;
    //         connection.query(update_sql,(err,result)=>{
    //             if(err){
    //                 console.log(err);
    //                 res.status(400);
    //                 res.send({"message":"Update Failed!"});
    //             }
    //             else{
    //                 res.send({"message":"Update successfull!!!"})
    //             }
    //         })
    //     }
    //     if(mobile !== undefined && mobile.lenth===10){
    //         const update_sql=`UPDATE users SET mobile="${mobile}" WHERE id="${id}";`;
    //         connection.query(update_sql,(err,result)=>{
    //             if(err){
    //                 console.log(err);
    //                 res.status(400);
    //                 res.send({"message":"Update Failed!"});
    //             }
    //             else{
    //                 res.send({"message":"Update successfull!!!"})
    //             }
    //         })
    //     }
    //     if(password !== undefined && password!==""){
    //         const update_sql=`UPDATE users SET \`password\`="${name}" WHERE id="${id}";`;
    //         connection.query(update_sql,(err,result)=>{
    //             if(err){
    //                 console.log(err);
    //                 res.status(400);
    //                 res.send({"message":"Update Failed!"});
    //             }
    //             else{
    //                 res.send({"message":"Update successfull!!!"})
    //             }
    //         })
    //     }
    //     if(blocked==="YES"||blocked==="NO"){
    //         const update_sql=`UPDATE users SET blocked="${blocked}" WHERE id="${id}";`;
    //         connection.query(update_sql,(err,result)=>{
    //             if(err){
    //                 console.log(err);
    //                 res.status(400);
    //                 res.send({"message":"Update Failed!"});
    //             }
    //             else{
    //                 res.send({"message":"Update successfull!!!"})
    //             }
    //         })
    //     }
    // }
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
app.listen(port,()=>{console.log(`Listening to port ${port}!`)}); 
