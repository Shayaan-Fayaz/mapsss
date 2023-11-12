const AppError = require('./../utils/appError');


const sendErrorDev = (err, res) => {
    console.error('ERROR: ', err)
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

const sendErrorProd = (err, res) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }else{
        console.error('ERROR: ', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        })
    }
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    let keyValue;
    let value;

    for(const key in err.keyValue){
        keyValue = key;
        value = err.keyValue[key];
    }
    const message = `Duplicate field value: "${value}". Please use another value.`
    return new AppError(message, 400);
}


module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // console.log(err);

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res)
    } else{
        let error = Object.assign({}, err)
        // console.log(err.message)

        if(err.message === 'There is no room with that passcode'){
            return sendErrorProd(err, res)
        }

        if(err.code === 11000) error = handleDuplicateFieldsDB(error);
        if(err.name === 'ValidationError') error = handleValidationErrorDB(error);
        sendErrorProd(error, res);
    }
    
}