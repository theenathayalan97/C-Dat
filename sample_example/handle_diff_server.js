pipeline {
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
        DEPLOYED_SERVER = '13.233.125.17'
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
        // stage('Checkout_Frontend') {
        //     steps {
        //         git branch: 'master', credentialsId: 'aws_codecommit_credentials', url: CODECOMMIT_REPO_URL_FRONTEND
        //     }
        // }

        stage('Logging into AWS ECR') {
            steps {
                script {
                    withCredentials([sshUserPrivateKey(credentialsId: 'docker_push', keyFileVariable: 'EC2_PEM_FILE')]) {
                    sh """
                                    chmod 400 $EC2_PEM_FILE
                                    ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} 'export AWS_ACCESS_KEY_ID=AKIAYYSKDOZNEKZKVKKN; export AWS_SECRET_ACCESS_KEY=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;' "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                                    
                                """
                    }
                }
            }
        }

// stage('Check and Stop Container frontend') {
//     steps {
//         script {
//             def portToStop = DOCKER_HOST_PORT_FRONTEND.toInt()
//             def serverIp = DEPLOYED_SERVER

//             echo "Checking for containers running on port ${portToStop} on server ${serverIp}"

//             // Use 'netstat' command to check if the port is being used
//             def processInfo = sh(script: "netstat -tuln | grep ${portToStop} | grep LISTEN", returnStdout: true).trim()

//             if (processInfo) {
//                 // Split the output to get the PID (Process ID)
//                 def pid = processInfo.split("\\s+")[6]

//                 echo "Found a process running on port ${portToStop}, PID: ${pid}. Stopping and removing..."
                
//                 // Stop the process using 'kill' command
//                 sh "ssh -i ${SSH} ubuntu@${serverIp} kill ${pid}"
//             } else {
//                 echo "No process found running on port ${portToStop}"
//             }
//         }
//     }
// }

        
//       stage('Check and Stop Container frontend') {
//     steps {
//         script {
//             echo('Checking and stopping containers on port 3000')
//             withCredentials([sshUserPrivateKey(credentialsId: 'docker_push', keyFileVariable: 'EC2_PEM_FILE')]) {
//             def portToStop = 3000
//             def containerIds = sh(script: ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} "docker ps -q --filter=expose=${portToStop}", returnStdout: true).trim()
//                 if (containerIds) {
//                     // Split the container IDs and stop each container
//                     containerIds.split("\n").each { containerId ->
//                         ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} "docker stop ${containerId}"
//                         ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} "docker rm ${containerId}"
//                         echo "Stopped and removed container ID: ${containerId}"
//                     }
//                 } else {
//                     echo "No containers found using port ${portToStop}"
//                 }
//             }
//         }
//     }
// }

        stage('Check and Stop Container frontend') {
    steps {
        script {
            echo 'Checking and stopping containers on port 3000'
            withCredentials([sshUserPrivateKey(credentialsId: 'docker_push', keyFileVariable: 'EC2_PEM_FILE')]) {
                def portToStop = 3000
                def containerIds = sh(
                    script: "ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} \"docker ps -q --filter=expose=${portToStop}\"",
                    returnStdout: true
                ).trim()

                if (containerIds) {
                    // Split the container IDs and stop each container
                    containerIds.split("\n").each { containerId ->
                        sh "ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} \"docker stop ${containerId}\""
                        sh "ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} \"docker rm ${containerId}\""
                        echo "Stopped and removed container ID: ${containerId}"
                    }
                } else {
                    echo "No containers found using port ${portToStop}"
                }
            }
        }
    }
}



        stage('Deploy') {
        steps {
            script {
                withCredentials([sshUserPrivateKey(credentialsId: 'docker_push', keyFileVariable: 'EC2_PEM_FILE')]) {
                            // withAWS(credentials: 'aws_codecommit_credentials', region: AWS_DEFAULT_REGION) {
                                sh """
                                    chmod 400 $EC2_PEM_FILE
                                    ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} 'export AWS_ACCESS_KEY_ID=AKIAYYSKDOZNEKZKVKKN; export AWS_SECRET_ACCESS_KEY=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;' "aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com"
                                    ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} "docker pull ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}"
                                    ssh -i $EC2_PEM_FILE -o StrictHostKeyChecking=no ubuntu@${DEPLOYED_SERVER} "docker run -d -p 5000:3000 ${YOUR_CONTAINER_FRONTEND}:${IMAGE_TAG_front}"
                                """
                }
            }
        }
    }
    }
}