const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const simpleGit = require('simple-git');

async function createSnsTopic(req,res){
    try {
        const tfConfig = `
        resource "aws_sns_topic" "${req.body.topic_name}" {
          name =  "${req.body.topic_name}"
          display_name = "${req.body.display_name}"
          tags = {
            Name = "${req.body.topic_name}"
          }
        }
        
        resource "aws_sns_topic_subscription" "${req.body.subscription_name}" {
          topic_arn = aws_sns_topic.${req.body.topic_name}.arn
          protocol = "${req.body.protocol}"
          endpoint = "${req.body.endpoint}"
        }`;
  
        // Write the Terraform configuration to a file
        fs.appendFileSync('D:/DAT/sns_topic.tf', tfConfig);
        const configPath = 'D:/DAT';
        process.chdir(configPath);
  
        //  Run Terraform commands
        exec('terraform init', (error, initStdout, initStderr) => {
          if (error) {
            console.log('Terraform SNS topic created  failed:', initStderr);
            return res.status(400).json({ message: "Terraform SNS topic created  failed"});
          } else {
            console.log('Terraform SNS topic created  succeeded.');
            exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
              if (applyError) {
                console.log('SNS topic created failed:', applyStderr);
                return res.status(400).json({message: "SNS topic created failed"});
              } else {
                console.log('Terraform apply succeeded.');
                return res.status(200).json({message: "SNS topic created successfully."});
              }
            });
          }
        });
    } catch (error) {
      return res.status(400).json({ message: "something went wrong ", result: error.message }); 
    }
}

async function queueCreate(req, res){
  try {
    const tfConfig = `
    resource "aws_sqs_queue" "${req.body.queue_name}" {
      name =  "${req.body.queue_name}"
      visibility_timeout_seconds = 30
      delay_seconds             = 30
      max_message_size          = 2048
      message_retention_seconds = 86400
      receive_wait_time_seconds = 10
    }`;

    // Write the Terraform configuration to a file
    fs.appendFileSync('D:/DAT/sqs_queue.tf', tfConfig);
    
    // Define the relative path to the Terraform configuration directory
    const configPath = 'D:/DAT';

    // Change the current working directory to the Terraform configuration directory
    process.chdir(configPath);

    //  Run Terraform commands
    exec('terraform init', (error, initStdout, initStderr) => {
      if (error) {
        console.error('Terraform initialization failed:', initStderr);
        res.status(400).send("Terraform initialization failed");
      } else {
        console.log('Terraform initialization succeeded.');
        exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
          if (applyError) {
            console.error('Terraform apply failed:', applyStderr);
            res.status(400).send("Terraform apply failed");
          } else {
            console.log('Terraform apply succeeded.');
            res.status(200).send("Queue created successfully.");
          }
        });
      }
    });
  } catch (error) {
    return res.status(400).json({ message: "something went wrong ", result: error.message }); 
  }
}

module.exports = { createSnsTopic, queueCreate }