let jenkins = ["pipeline {
    agent any

    environment {

        AWS_DEFAULT_REGION = 'ap-south-1'
        AWS_ACCOUNT_ID = '602524579418'
        CODECOMMIT_REPO_URL_FRONTEND = 'https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/flames_frontend'
        CODECOMMIT_REPO_URL_BACKEND = 'https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/flames_backend'
        ECR_REPO_NAME_FRONTEND = 'flamesrepo_frontend'
        ECR_REPO_NAME_BACKEND = 'flamesrepo_backend'
        DOCKER_IMAGE_NAME_FRONTEND = 'ubuntu_web'
        DOCKER_IMAGE_NAME_BACKEND = 'ubuntu_api'
        DEPLOYED_SERVER = '65.2.181.61'
        DOCKER_HOST_PORT_FRONTEND = '3000'
        DOCKER_HOST_PORT_BACKEND = '8001'
        YOUR_CONTAINER_FRONTEND = '602524579418.dkr.ecr.ap-south-1.amazonaws.com/flamesrepo_frontend'
        YOUR_CONTAINER_BACKEND = '602524579418.dkr.ecr.ap-south-1.amazonaws.com/flamesrepo_backend'
        AWS_CREDENTIALS = credentials('aws_provider') // Use the ID you set in Jenkins credentials
        IMAGE_TAG_front = "sample"
        IMAGE_TAG_back = "example"
        KNOWN_HOSTS_FILE = "/var/lib/jenkins/.ssh/known_hosts"
        SSH = credentials('jenkins_key')
        // SSH_CREDENTIALS = credentials('jenkins_key')
    }

    stages {
        stage('Checkout_Frontend') {
            steps {
                git branch: 'master', credentialsId: 'aws_codecommit_credentials', url: CODECOMMIT_REPO_URL_FRONTEND
            }
        }

        stage('Logging into AWS ECR') {
            steps {
                script {
                    sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                }
            }
        }

        stage('Build Docker Image frontend') {
            steps {
                script {
                    echo('build the image')
                    // Build Docker image
                    def dockerImage = docker.build("${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}")
                    echo('front end image build success')
                    dockerImage.push()
                }
            }
        }

        stage('Pushing to ECR frontend') {
            steps {
                script {
                    echo('Pushing the image')
                    sh "docker tag ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front} ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}"
                    sh "docker push ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}"
                    echo('Image pushed to the repository successfully')
                }
            }
        }
        
        stage('Check and Stop Container frontend') {
            steps {
                script {
                    echo('check & stop stage')
                    def portToStop = 3000
                    def containerIds = sh(script: "docker ps -q --filter=expose=${portToStop}", returnStdout: true).trim()
                    if (containerIds) {
                        // Split the container IDs and stop each container
                        containerIds.split("\n").each { containerId ->
                            sh "docker stop ${containerId}"
                            sh "docker rm ${containerId}"
                            echo "Stopped and removed container ID: ${containerId}"
                        }
                    } else {
                        echo "No containers found using port ${portToStop}"
                    }
                }
            }
        }
        
//       stage('Deploying to Docker frontend using ssh') {
//     steps {
//         // Use SSH to connect to the remote server and deploy
//         sh """
//             chmod 400 'SSH_CREDENTIALS'
//             ec2-65-2-181-61.ap-south-1.compute.amazonaws.com
//             ssh -o StrictHostKeyChecking=no -i 'SSH_CREDENTIALS' ubuntu@${DEPLOYED_SERVER} << 'EOF'
//                 aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com
//                 docker pull ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}
//                 docker run -d -p 5000:3000 ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}
//             EOF
//         """
//     }
// }



//         stage('Deploy') {
//             steps {
//                 script {
//                     withCredentials([file(credentialsId: 'my-key-pair', variable: 'EC2_PEM_FILE')]) {
//                         sh '''
//                             chmod 400 my-key-pair.pem
//                             ssh -v -i my-key-pair.pem ubuntu@ec2-65-2-181-61.ap-south-1.compute.amazonaws.com
//                             ssh -v -i "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
//                             ssh -i $EC2_PEM_FILE ubuntu@${DEPLOYED_SERVER} "docker pull your-ecr-url/your-docker-image-name:latest"
//                             ssh -i $EC2_PEM_FILE ubuntu@${DEPLOYED_SERVER} "docker run -d -p 80:80 your-ecr-url/your-docker-image-name:latest"
//                         '''
//                     }
//                 }
//             }

// }

        stage('Deploy') {
    steps {
        script {
            // Use withCredentials to securely access the PEM file
            withCredentials([sshUserPrivateKey(credentialsId: 'id_rsa', keyFileVariable: 'EC2_PEM_FILE')]) {
                
                // # Set correct permissions for the SSH private key
                sh 'chmod 400 $EC2_PEM_FILE'

// # Execute SSH command to change permissions on the remote server
sh 'chmod 600 $EC2_PEM_FILE'

                
                sh "ssh -i $EC2_PEM_FILE -o  ubuntu@ec2-65-2-181-61.ap-south-1.compute.amazonaws.com chmod 400 chmod 600 $EC2_PEM_FILE"
                
                // Log in to AWS ECR on the remote server
                sh "ssh -i $EC2_PEM_FILE -o  ubuntu@ec2-65-2-181-61.ap-south-1.compute.amazonaws.com 'aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com'"
                
                // Pull the Docker image on the remote server
                sh "ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@ec2-65-2-181-61.ap-south-1.compute.amazonaws.com 'docker pull ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}'"
                
                // Run the Docker container on the remote server
                sh "ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@ec2-65-2-181-61.ap-south-1.compute.amazonaws.com 'docker run -d -p 5000:3000 ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}'"
                
            }
        }
    }
}

        
        // stage('Checkout_backend') {
        //     steps {
        //         git branch: 'master', credentialsId: 'aws_codecommit_credentials', url: CODECOMMIT_REPO_URL_BACKEND
        //     }
        // }


        //  stage('Build Docker Image backend') {
        //     steps {
        //         script {
        //             echo('build the back end image')
        //             // Build Docker image
        //             def dockerImage = docker.build("${YOUR_CONTAINER_BACKEND}:${IMAGE_TAG_back}")
        //             dockerImage.push()
        //         }
        //     }
        // }

        // stage('Pushing to ECR backend') {
        //     steps {
        //         script {
        //             echo('Pushing the image')
        //             sh "docker tag ${YOUR_CONTAINER_BACKEND}:${IMAGE_TAG_back} ${YOUR_CONTAINER_BACKEND}:${IMAGE_TAG_back}"
        //             sh "docker push ${YOUR_CONTAINER_BACKEND}:${IMAGE_TAG_back}"
        //             echo('Image pushed to the repository successfully')
        //         }
        //     }
        // }
        
        // // stage('Deploying to Docker backend with ssh') {
        // //     steps {
        // //         script {
        // //             sshagent(credentials: ['SSH_CREDENTIALS']) {
        // //                 sshScript remote: "your_deployed_server_username@${DEPLOYED_SERVER}", script: '''
        // //                     docker pull ${YOUR_CONTAINER_BACKEND}:${IMAGE_TAG_back}
        // //                     docker stop backend_container || true
        // //                     docker rm backend_container || true
        // //                     docker run -d --name backend_container -p ${DOCKER_HOST_PORT_BACKEND}:8001 ${YOUR_CONTAINER_BACKEND}:${IMAGE_TAG_back}
        // //                 '''
        // //             }
        // //         }
        // //     }
        // // }

        // stage('Deploying to Docker backend') {
        //     steps {
        //         script {
        //             // Pull the image from ECR
        //             sh "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
        //             sh "docker pull ${YOUR_CONTAINER_BACKEND}:${IMAGE_TAG_back}"
        //             echo('docker image pulled')
        //         }
        //     }
        // }

        //   stage('Check and Stop Container backend') {
        //     steps {
        //         script {
        //             echo('check & stop stage')
        //             def portToStop = 8001
        //             def containerIds = sh(script: "docker ps -q --filter=expose=${portToStop}", returnStdout: true).trim()
        //             if (containerIds) {
        //                 // Split the container IDs and stop each container
        //                 containerIds.split("\n").each { containerId ->
        //                     sh "docker stop ${containerId}"
        //                     sh "docker rm ${containerId}"
        //                     echo "Stopped and removed container ID: ${containerId}"
        //                 }
        //             } else {
        //                 echo "No containers found using port ${portToStop}"
        //             }
        //         }
        //     }
        // }


        // stage('Checkout_Backend') {
        //     steps {
        //         git branch: 'master', credentialsId: 'aws_codecommit_credentials', url: CODECOMMIT_REPO_URL_BACKEND
        //     }
        // }


        // stage('Run New Container backend') {
        //     steps {
        //         script {
        //             sh "docker run -d -p 7001:8001 ${YOUR_CONTAINER_BACKEND}:${IMAGE_TAG_back}"
        //         }
        //     }
        // }
        
    
    }
}
"]