import RequestLog from "../models/requestLog.model.js"

class RequestLogRepository {

    async create(log_data) {
        return await RequestLog.create(log_data)
    }

}

//El RequestLogRepository es un singleton, solo tiene una instancia
const request_log_repository = new RequestLogRepository()

export default request_log_repository
