module.exports = (database, Sequelize) => {
    const User = database.define('services', {
        uuid: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4
        },
        service_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        tag_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        organization_id:{
            type:Sequelize.STRING,
            allowNull:true
        },
        token:{
            type:Sequelize.JSON,
            allowNull:true
        },
        is_deleted:{
            type:Sequelize.BOOLEAN,
            allowNull:false,
            defaultValue:false
        }
    },
        {
            timeStamps: true
        })
    return User

}