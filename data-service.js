const fs = require("fs");

let employees = [];
let departments = [];

module.exports.initialize = function () {
        return new Promise((resolve, reject) => {
            fs.readFile("./data/employees.json", 'utf8', (err, data) => {
                if(err) {
                    reject(err);
                } else {
                    employees = JSON.parse(data);

                fs.readFile("./data/departments.json", 'utf8', (err, data) => {
                    if(err) {
                        reject(err);
                    } else {
                        departments = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}

module.exports.getAllEmployees = function () {
    return new Promise((resolve, reject) => {
        (employees.length > 0) ? resolve(employees) : reject("no results returned");
    });
}

module.exports.getManagers = function () {
    return new Promise((resolve, reject) => {
       if(employees.length > 0) {
            resolve(employees.filter(employee => employee.isManager));
       } else {
            reject("no results returned");
       }
    });
}

module.exports.getDepartments = function () {
    return new Promise((resolve, reject) => {
        (departments.length > 0) ? resolve(departments) : reject("no results returned");        
    });
}