import Sequelize from "sequelize";

import User from "../app/models/User";
import File from "../app/models/File";
import Appointment from "../app/models/Appointment";

import databaseConfig from "../config/database";

const models = [User, File, Appointment];

//conexão com o banco

class Database {
  constructor() {
    this.initi();
  }
  //faz a conexão com o banco e carrega os modulos
  initi() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new Database();
