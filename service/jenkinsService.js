const fs = require('fs');
const { exec } = require('child_process');
const path = require('../path');
const respounce = require('../response/response')

async function jenkinsInstance(req, res, message){
    try {
        const tfConfig = `
        resource "aws_instance" "jenkins_server" {
            ami                         = "ami-03f4878755434977f"
            instance_type               = "t2.medium"
            key_name                    = "Jenkins"
            associate_public_ip_address = true
            vpc_security_group_ids      = ["sg-0c1894e242d5ce805"]
           
            user_data = <<-EOF
                      #!/bin/bash
                      sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
                      echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
                      sudo apt-get update
                      sudo apt-get install -y fontconfig openjdk-17-jre
                      sudo apt-get install -y jenkins
           
                      # Wait for Jenkins to start
                      until sudo systemctl is-active jenkins; do sleep 5; done
           
                      # Fetch and output the current initial admin password
                      sudo cat /var/lib/jenkins/secrets/initialAdminPassword
                  EOF
           
            tags = {
              Name = "jenkins-server"
            }
          }
           
          output "jenkins_initial_admin_password" {
            value = aws_instance.jenkins_server.user_data
          }
           
        `

        fs.writeFileSync(`${path.directory}/jenkinsInstance.tf`, tfConfig);
        const configPath = `${path.directory}`;
        process.chdir(configPath);

        exec('terraform init -upgrade', (error, initStdout, initStderr) => {
            if (error) {
                console.error('Terraform login initialization failed:', initStderr);
                res.status(400).send("Terraform login initialization failed");
            } else {
                // console.log(3);
                console.log('Terraform login initialization succeeded.');
                exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
                    if (applyError) {
                        console.error('Jenkins Instance created:', applyStderr);
                        res.status(400).send("Jenkins Instance created failed");
                    } else {
                        console.log('Jenkins Instance created succeeded.');
                        respounce.createMessage(req, res, message)
                    }
                });
            }
        })
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}


async function jenkinsData(req, res, message) {
    try {
        const tfConfig = `
        terraform {
            required_providers {
              jenkins = {
                source  = "overmike/jenkins"
                version = "0.6.1"
              }
            }
          }
          
          provider "jenkins" {
            server_url = "http://3.109.181.119:8080/"  # Specify the correct Jenkins server URL
            username   = "root"
            password   = "root"
          }
          
          resource "jenkins_job" "dys_jenkins" {
            name     = "dys_jenkins"
            template = file("job.xml")
          }`

        fs.writeFileSync(`${path.directory}/service/jenkins_pip.tf`, tfConfig);
        const configPath = `${path.directory}/service`;
        process.chdir(configPath);

        let findValue = {}
        findValue.AWS_DEFAULT_REGION = 'ap-south-1'
        findValue.AWS_ACCOUNT_ID = '482088842115'
        findValue.CODECOMMIT_REPO_URL = 'https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/datayaan_website2.0'
        findValue.ECR_REPO_NAME = 'sample-repo'
        findValue.DOCKER_IMAGE_NAME = 'sample-repo'
        findValue.DOCKER_HOST_IP = '13.233.110.194'
        findValue.DOCKER_HOST_PORT = '80'
        findValue.YOUR_CONTAINER = '482088842115.dkr.ecr.ap-south-1.amazonaws.com/sample-repo'
        // AWS_CREDENTIALS= credentials('aws_provider'),// Use the ID you set in Jenkins credentials
        findValue.IMAGE_TAG = "sample-repo"



        module.exports = {
            findValue
        }
        exec('terraform init -upgrade', (error, initStdout, initStderr) => {
            if (error) {
                console.error('Terraform login initialization failed:', initStderr);
                res.status(400).send("Terraform login initialization failed");
            } else {
                // console.log(3);
                console.log('Terraform login initialization succeeded.');
                exec('terraform apply -auto-approve', (applyError, applyStdout, applyStderr) => {
                    if (applyError) {
                        console.error('Terraform login failed:', applyStderr);
                        res.status(400).send("Terraform login failed");
                    } else {
                        console.log('Jenkins  succeeded.');
                        respounce.createMessage(req, res, message)
                    }
                });
            }
        })
    } catch (error) {
        return res.status(400).json({ message: " something went wrong ", result: error.message })
    }
}

module.exports = {
    jenkinsData
}