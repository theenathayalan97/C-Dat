const awsController = require("../controller/awsController")
const router=require("express").Router();

// finish router
router.post("/login",awsController.aws_login)
router.post("/s3_bucket",awsController.s3_bucket)
router.get("/vpclist",awsController.vpc_list);
router.get("/SG_list",awsController.security_group_list)
router.get("/subnet_list",awsController.subnet_list)
router.get("/os_list",awsController.os_list)
router.post("/queue_creation", awsController.create_queue)
router.post("/sns_topic", awsController.create_sns_topic)
router.get("/code_pull", awsController.code_pull)
router.post("/code_push", awsController.push_code)
router.post("/load_balancer", awsController.load_balancer)
router.delete("/account_delete",awsController.accountDestroy)
router.delete("/file_delete",awsController.serviceDestroy)

//process
router.post("/architecture",awsController.architecture)

//deploy process
// router.post("/mailsend",awsController.send_email)
router.post("/docker_instance",awsController.createDockerInstance)
router.post("/container_deploy",awsController.createContainerDeploy)
router.post("/jenkins_pipeline",awsController.jenkinsPipeline)
router.post("/cloud_app_runner",awsController.appRunner)
router.post("/ebs",awsController.ebs)
router.post("/code_pipeline",awsController.code_pipeline)

//Not using below router
router.post("/rosa",awsController.rosa)

module.exports=router