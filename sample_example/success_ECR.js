pipeline{
    agent any
    
    environment{
        CODECOMMIT_REPO_URL = 'https://git-codecommit.ap-south-1.amazonaws.com/v1/repos/testing-1'
        AWS_CREDENTIALS = credentials('aws_credential_dys_learning')
    }
    
    stages {
        stage("check out"){
            steps{
                git branch : "main", credentialsId : 'Aws_codecommit_dys_learning', url : CODECOMMIT_REPO_URL
            }
        }
           stage("Ecr login") {
        steps {
            withCredentials([usernamePassword(credentialsId: 'aws_credential_dys_learning', usernameVariable: 'AWS_CREDENTIALS_USR', passwordVariable: 'AWS_CREDENTIALS_PSW')]) {
                sh """
                export AWS_ACCESS_KEY_ID=${AWS_CREDENTIALS_USR}
                export AWS_SECRET_ACCESS_KEY=${AWS_CREDENTIALS_PSW}
                aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 729416225111.dkr.ecr.ap-south-1.amazonaws.com
                """
            }
        }
    }

        stage('Build Docker Image frontend') {
            steps {
                script {
                    echo('build the image')
                    // Build Docker image
                    sh'docker build -t pipeline_test .'
                    // def dockerImage = docker.build("pipeline_test:latest")
                    // echo('front end image build success')
                    // dockerImage.push()
                }
            }
        }
        stage('push image') {
            steps {
                script {
                    echo('ECR entry')
                    sh'docker tag pipeline_test:latest 729416225111.dkr.ecr.ap-south-1.amazonaws.com/pipeline_test:latest'
                    sh'docker push 729416225111.dkr.ecr.ap-south-1.amazonaws.com/pipeline_test:latest'
                }
            }
        }
    }
}
