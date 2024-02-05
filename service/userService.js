const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')
require('dotenv').config()

const jwt = require('jsonwebtoken');

// const access_key = process.env.access_key
// const secret_key = process.env.secret_key

//database
let database = require('../Connections/postgres')
let user = database.users

async function signUp(req, res, message) {
  try {
    // console.log(1);
    let register = {}
    let name = req.body.user_name
    let password = req.body.password
    let email = req.body.email
    let phonenumber = req.body.phonenumber

    register.name = name
    register.password = password
    register.email = email
    register.phonenumber = phonenumber

    let userRegister = await user.create(register)
    return res.status(201).json({ message: "user register successfully" })

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function userLogin(req, res, message) {
  try {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let phonenumber = req.body.phonenumber
    if(!phonenumber){
      return res.status(400).json({ message: "phone number required"})
    }
    let password = req.body.password
    if(!password){
      return res.status(400).json({ message: "password required"})
    }
    // console.log(1);
    let data = await user.findOne({
      where: { phonenumber: phonenumber }
    })
    if(!data){
      return res.status(404).json({ message: "user not found"})
    }
    if (data.phonenumber == phonenumber) {
      if (data.password == password) {
        let user = {
          uuid: data.uuid,
          role: data.role,
          organization_id: data.organization_id
        }
        const token = jwt.sign(user, jwtSecretKey);
        return res.status(201).json({ message: "log in successfully", result: token })
      } else {
        return res.status(400).json({ message: "user phone number and password incorrect" })
      }
    } else {
      return res.status(400).json({ message: "user phone number and password incorrect" })
    }

  } catch (error) {
    return res.status(400).json({ message: " something went wrong ", result: error.message })
  }
}

async function s3_bucket_creation(req, res, message) {
  try {
    const bucketname = req.body.bucket_name;
    if (!bucketname) {
      return res.status(400).json({ message: "Bucket name is required" });
    }
    const tfConfigPath = `${path.directory}/s3_bucket.tf`;

    const tfConfig = `
      resource "aws_s3_bucket" "${req.body.bucket_name}" {
          bucket =  "${req.body.bucket_name}"
          lifecycle {
                  prevent_destroy = true
                } 
        }`;
    // Write the Terraform configuration to a file
    fs.writeFileSync(`${path.directory}/s3_bucket.tf`, tfConfig);
    const configPath = `${path.directory}`;
    process.chdir(configPath);

    exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
      if (applyError) {
        console.error('Terraform S3 Bucket creation failed:', applyStderr);
        return res.status(400).json({ message: "Terraform S3 Bucket creation failed" });
      } else {
        console.log('Terraform apply succeeded.');
        respounce.createMessage(req, res, message)
      }
    });
  }
  catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

module.exports = { signUp, userLogin, s3_bucket_creation };