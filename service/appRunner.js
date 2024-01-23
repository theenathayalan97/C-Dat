const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../responce/responce')

async function appRunner(req, res, message){
    try {
        let tfConfig = `
        resource "aws_apprunner_service" "example" {
            service_name = "my-service"
          
            source_configuration {
              authentication_configuration {
                connection_arn = "arn:aws:apprunner:ap-south-1:482088842115:connection/demo/6b10ee60c303423d9fc4676ad9f9a22a"
              }
              code_repository {
                code_configuration {
                  code_configuration_values {
                    build_command = "npm install --save"
                    port          = "3000"
                    runtime       = "NODEJS_14"
                    start_command = "npm start"
                  }
                  configuration_source = "API"
                }
                repository_url = "https://github.com/Jeyaanitha/yaantrac-frontend"
                source_code_version {
                  type  = "BRANCH"
                  value = "master"
                }
              }
            }
          
            network_configuration {
              egress_configuration {
                egress_type       = "VPC"
                 vpc_connector_arn = "arn:aws:apprunner:ap-south-1:482088842115:vpcconnector/vpc-name/1/3755484e0a1e4b0d8d47d9f28c523c63"
              }
            }
          
            tags = {
              Name = "example-apprunner-service"
            }
          }
        `

        fs.writeFileSync(`${path.directory}/apprunner.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

         // Run Terraform commands
         exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
            if (applyError) {
                console.log('app runner creation failed:', applyStderr);
                return res.status(400).json({ message: "app runner creation failed" });
            } else {
                console.log('Terraform apply succeeded.');
                respounce.createMessage(req, res, message);
            }
        });
    } catch (error) {
        return res.status(400).json({ message: "something went wrong ", result: error.message });
    }
}

module.exports = { appRunner }