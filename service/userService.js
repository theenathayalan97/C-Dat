const fs = require('fs');
const { exec } = require('child_process');

async function userLogin(req, res){
    try {
        if (`${req.body.username}` === "demo" && `${req.body.password}` === "demo@123") {
            const tfConfig = `
                  provider "aws" {
                    access_key = "AKIA2TVEYKFL66QXICEW"
                    secret_key = "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"
                      region     = "ap-south-1"
                    }`;
      
            // Write the Terraform configuration to a file
            fs.appendFileSync('/home/dys/project/Backend-Terraform-Nodejs/main.tf', tfConfig);
            
            // Define the relative path to the Terraform configuration directory
            const configPath = '/home/dys/project/Backend-Terraform-Nodejs';
      
            // Change the current working directory to the Terraform configuration directory
            process.chdir(configPath);
      
            //  Run Terraform commands
             exec('terraform init', (error, initStdout, initStderr) => {
              if (error) {
                console.error('Terraform login initialization failed:', initStderr);
                res.status(400).send("Terraform login initialization failed");
              } else {
                console.log('Terraform login initialization succeeded.');
                exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
                  if (applyError) {
                    console.error('Terraform login failed:', applyStderr);
                    res.status(400).send("Terraform login failed");
                  } else {
                    console.log('Terraform login succeeded.');
                    return true;
                  }
                });
              }
            });
          }
          else {
            res.status(404).send("Invalid user name and password")
          }
    } catch (error) {
        return res.status(400).json({ message : " something went wrong ", result: error.message })
    }
}

async function s3_bucket_creation(req, res) {
  try {
      const bucketname = req.body.bucket_name;
      if (!bucketname) {
          return res.status(400).json({ message: "Bucket name is required" });
      }
      const tfConfigPath = 'D:/DAT/s3_bucket.tf';

      // Check if the Terraform configuration file exists, and create it if not
      if (!fs.existsSync(tfConfigPath)) {
          fs.writeFileSync(tfConfigPath, ''); // Create an empty file
      }
      const tfContent = fs.readFileSync(tfConfigPath, 'utf8');
      if (tfContent.includes(`"${bucketname}"`)) {
          console.log(`S3 with the name "${bucketname}" already exists in the configuration.`);
          return res.status(400).send(`S3 with the name "${bucketname}" already exists in the configuration.`)
      } else {
          const tfConfig = `
      resource "aws_s3_bucket" "${req.body.bucket_name}" {
          bucket =  "${req.body.bucket_name}"
          lifecycle {
                  prevent_destroy = true
                } 
        }`;
          // Write the Terraform configuration to a file
          fs.appendFileSync('D:/DAT/s3_bucket.tf', tfConfig);
      }
      const configPath = 'D:/DAT';
      process.chdir(configPath);

      exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
          if (applyError) {
              console.error('Terraform S3 Bucket creation failed:', applyStderr);
              return res.status(400).json({ message: "Terraform S3 Bucket creation failed" });
          } else {
              return true;
          }
      });
  }
  catch (error) {
      return res.status(400).json({ message: "something went wrong ", result: error.message });
  }
}

module.exports = {  userLogin, s3_bucket_creation };