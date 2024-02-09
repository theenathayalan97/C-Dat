const userController = require("../controller/userController/userController")
const serviceController = require("../controller/serviceController/serviceController")
const architectureController = require('../controller/archetecController/archetectureController')
const getServiceController = require("../controller/serviceController/getServiceController")
const deploymentController = require("../controller/deployment/deploymentController")
const middleware= require('../middleware/auth')
const router=require("express").Router();

// finish router
//super admin
router.post("/superAdmin_signup", middleware.authorization, middleware.authentication(['superAdmin'],true), userController.superAdminSignUp);

// organization
router.post("/organization_signup", middleware.authorization, middleware.authentication(['superAdmin'],true), userController.organizationSignUp);
router.post("/organization_login", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), userController.organizationLogin);

//user
router.post("/signup", userController.userSignUp);
router.post("/login",  userController.login);
router.post("/user_signup", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), userController.adminSignUp);

// get
router.get("/user_list",middleware.authorization, middleware.authentication(['superAdmin','admin'],true), userController.userGet);
router.get("/organization_list",middleware.authorization, middleware.authentication(['superAdmin','admin','user'],true), userController.organizationGet);
router.get("service_list",middleware.authorization, middleware.authentication(['superAdmin','admin'],true), userController.serviceGet)

//service
router.post("/s3_bucket", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),serviceController.s3_bucket)
router.get("/vpclist", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),getServiceController.vpc_list);
router.get("/SG_list", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),getServiceController.security_group_list)
router.get("/subnet_list", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),getServiceController.subnet_list)
router.get("/os_list", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),getServiceController.os_list)
router.post("/queue_creation", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.create_queue)
router.post("/sns_topic", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.create_sns_topic)
router.get("/code_pull", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.code_pull)
router.post("/code_push", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.push_code)
router.post("/load_balancer", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.load_balancer)
router.post("/key_pair", middleware.authorization, middleware.authentication(['superAdmin','admin'],true), serviceController.key_pair)
router.delete("/account_delete", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),serviceController.accountDestroy)
router.delete("/file_delete", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),serviceController.serviceDestroy)

//deploy process
router.post("/docker_instance", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),deploymentController.createDockerInstance) //ECR
router.post("/container_deploy", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),deploymentController.createContainerDeploy) //ECS
router.post("/cloud_app_runner", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),deploymentController.appRunner) //App runner
router.post("/jenkins_pipeline", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),deploymentController.jenkinsPipeline) //Jenkins
router.post("/ebs", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),deploymentController.ebs) //EBS
router.post("/code_pipeline", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),deploymentController.code_pipeline)

//process
router.post("/architecture", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),architectureController.architecture)

//Not using below router
router.post("/rosa", middleware.authorization, middleware.authentication(['superAdmin','admin'],true),deploymentController.rosa)

module.exports=router