
document.addEventListener("DOMContentLoaded", function () {

    // HTML ELEMENTS
    const employeeForm = document.getElementById("employeeForm");
    const employeeList = document.getElementById("employeeList");
    const searchInput = document.getElementById("search");
    const departmentFilter = document.getElementById("departmentFilter");

    // LOAD EMPLOYEE DATA
    let employees = [];

    try {
        employees = JSON.parse(localStorage.getItem("employees")) || [];
    } catch (error) {
        employees = [];
    }

    // OLD DATA COMPATIBILITY
    employees = employees.map(function (emp) {
        return {
            ...emp,
            status: emp.status || "Active",
            photo: emp.photo || ""
        };
    });

    // GENERATE EMPLOYEE ID
    function generateEmployeeId() {
        let highestId = 1000;

        employees.forEach(function (emp) {
            const number = parseInt(
                String(emp.id).replace("EMP", "")
            );

            if (!isNaN(number) && number > highestId) {
                highestId = number;
            }
        });

        return "EMP" + (highestId + 1);
    }

    // SAVE DATA
    function saveData() {
        localStorage.setItem(
            "employees",
            JSON.stringify(employees)
        );
    }

    // SAFE HTML
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[char];
        });
    }

    // DASHBOARD UPDATE
    function updateDashboard() {
        const total = employees.length;

        const itCount = employees.filter(function (emp) {
            return emp.department === "IT";
        }).length;

        const hrCount = employees.filter(function (emp) {
            return emp.department === "HR";
        }).length;

        const averageSalary = total
            ? employees.reduce(function (sum, emp) {
                return sum + Number(emp.salary || 0);
            }, 0) / total
            : 0;

        const totalElement = document.getElementById("totalEmployees");
        const itElement = document.getElementById("itEmployees");
        const hrElement = document.getElementById("hrEmployees");
        const salaryElement = document.getElementById("averageSalary");

        if (totalElement) totalElement.textContent = total;
        if (itElement) itElement.textContent = itCount;
        if (hrElement) hrElement.textContent = hrCount;

        if (salaryElement) {
            salaryElement.textContent =
                "₹" + Math.round(averageSalary).toLocaleString("en-IN");
        }
    }

    // DISPLAY EMPLOYEES
    function displayEmployees(data = employees) {

        if (!employeeList) return;

        employeeList.innerHTML = "";

        if (data.length === 0) {
            employeeList.innerHTML =
                "<p class='empty-message'>No Employees Found</p>";
            updateDashboard();
            return;
        }

        data.forEach(function (emp) {

            const card = document.createElement("div");
            card.className = "employee-card";

            const photoHTML = emp.photo
                ? `<img src="${emp.photo}" alt="Employee Photo" class="employee-photo">`
                : `<div class="employee-photo">👤</div>`;

            const status = String(emp.status).toLowerCase() === "inactive"
                ? "Inactive"
                : "Active";

            const statusClass = status === "Active"
                ? "active-status"
                : "inactive-status";

            card.innerHTML = `
                ${photoHTML}

                <h3>${escapeHTML(emp.name)}</h3>

                <p><strong>ID:</strong> ${escapeHTML(emp.id)}</p>
                <p><strong>Email:</strong> ${escapeHTML(emp.email)}</p>
                <p><strong>Phone:</strong> ${escapeHTML(emp.phone)}</p>
                <p><strong>Department:</strong> ${escapeHTML(emp.department)}</p>
                <p><strong>Salary:</strong> ₹${Number(emp.salary || 0).toLocaleString("en-IN")}</p>
                <p><strong>Joining Date:</strong> ${escapeHTML(emp.joiningDate)}</p>

                <p>
                    <strong>Status:</strong>
                    <span class="status-badge ${statusClass}">
                        ${status}
                    </span>
                </p>

                <div class="employee-actions">
                    <button type="button" class="view-btn"
                        data-action="view" data-id="${escapeHTML(emp.id)}">
                        View
                    </button>

                    <button type="button" class="edit-btn"
                        data-action="edit" data-id="${escapeHTML(emp.id)}">
                        Edit
                    </button>

                    <button type="button" class="delete-btn"
                        data-action="delete" data-id="${escapeHTML(emp.id)}">
                        Delete
                    </button>
                </div>
            `;

            employeeList.appendChild(card);
        });

        updateDashboard();
    }

    // VIEW EMPLOYEE PROFILE
    window.viewProfile = function (id) {

        const emp = employees.find(function (item) {
            return item.id === id;
        });

        if (!emp) return;

        const profileDetails = document.getElementById("profileDetails");

        if (!profileDetails) return;

        profileDetails.innerHTML = `
            <h2>Employee Profile</h2>

            ${emp.photo
                ? `<img src="${emp.photo}" alt="Employee Photo" class="employee-photo">`
                : "<h1>👤</h1>"}

            <p><strong>Employee ID:</strong> ${escapeHTML(emp.id)}</p>
            <p><strong>Name:</strong> ${escapeHTML(emp.name)}</p>
            <p><strong>Email:</strong> ${escapeHTML(emp.email)}</p>
            <p><strong>Phone:</strong> ${escapeHTML(emp.phone)}</p>
            <p><strong>Department:</strong> ${escapeHTML(emp.department)}</p>
            <p><strong>Salary:</strong> ₹${Number(emp.salary || 0).toLocaleString("en-IN")}</p>
            <p><strong>Joining Date:</strong> ${escapeHTML(emp.joiningDate)}</p>
            <p><strong>Status:</strong> ${escapeHTML(emp.status)}</p>
        `;

        const profileSection = document.getElementById("profileSection");

        if (profileSection) {
            profileSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    // CLOSE PROFILE
    window.closeProfile = function () {
        const profileDetails = document.getElementById("profileDetails");

        if (profileDetails) {
            profileDetails.innerHTML = "";
        }
    };

    // ADD / UPDATE EMPLOYEE
    if (employeeForm) {

        employeeForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const editId = document.getElementById("editId").value;
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const department = document.getElementById("department").value;
            const salary = document.getElementById("salary").value;
            const joiningDate = document.getElementById("joiningDate").value;
            const status = document.getElementById("status").value;

            const photoInput = document.getElementById("photo");
            const photoFile = photoInput.files[0];

            if (!name || !email || !phone || !department ||
                !salary || !joiningDate || !status) {

                alert("Please fill all required fields.");
                return;
            }

            if (Number(salary) < 0) {
                alert("Salary cannot be negative.");
                return;
            }

            function saveEmployee(photoData) {

                if (editId) {

                    const index = employees.findIndex(function (emp) {
                        return emp.id === editId;
                    });

                    if (index !== -1) {
                        employees[index] = {
                            ...employees[index],
                            name: name,
                            email: email,
                            phone: phone,
                            department: department,
                            salary: Number(salary),
                            joiningDate: joiningDate,
                            status: status,
                            photo: photoData
                        };

                        alert("Employee Updated Successfully!");
                    }

                } else {

                    const newEmployee = {
                        id: generateEmployeeId(),
                        name: name,
                        email: email,
                        phone: phone,
                        department: department,
                        salary: Number(salary),
                        joiningDate: joiningDate,
                        status: status,
                        photo: photoData
                    };

                    employees.push(newEmployee);

                    alert("Employee Added Successfully!");
                }

                saveData();
                displayEmployees();
                employeeForm.reset();

                document.getElementById("editId").value = "";

                const submitBtn = document.getElementById("submitBtn");

                if (submitBtn) {
                    submitBtn.textContent = "Add Employee";
                }
            }

            // PHOTO UPLOAD
            if (photoFile) {

                if (!photoFile.type.startsWith("image/")) {
                    alert("Please select an image file.");
                    return;
                }

                if (photoFile.size > 500 * 1024) {
                    alert("Photo must be below 500KB.");
                    return;
                }

                const reader = new FileReader();

                reader.onload = function () {
                    saveEmployee(reader.result);
                };

                reader.onerror = function () {
                    alert("Unable to read photo.");
                };

                reader.readAsDataURL(photoFile);

            } else {

                let oldPhoto = "";

                if (editId) {
                    const oldEmployee = employees.find(function (emp) {
                        return emp.id === editId;
                    });

                    if (oldEmployee) {
                        oldPhoto = oldEmployee.photo || "";
                    }
                }

                saveEmployee(oldPhoto);
            }
        });
    }

    // EMPLOYEE CARD BUTTON ACTIONS
    if (employeeList) {

        employeeList.addEventListener("click", function (event) {

            const button = event.target.closest("button[data-action]");

            if (!button) return;

            const id = button.dataset.id;
            const action = button.dataset.action;

            if (action === "view") {
                window.viewProfile(id);
            }

            if (action === "edit") {
                window.editEmployee(id);
            }

            if (action === "delete") {
                window.deleteEmployee(id);
            }
        });
    }

    // EDIT EMPLOYEE
    window.editEmployee = function (id) {

        const emp = employees.find(function (item) {
            return item.id === id;
        });

        if (!emp) return;

        document.getElementById("editId").value = emp.id;
        document.getElementById("name").value = emp.name;
        document.getElementById("email").value = emp.email;
        document.getElementById("phone").value = emp.phone;
        document.getElementById("department").value = emp.department;
        document.getElementById("salary").value = emp.salary;
        document.getElementById("joiningDate").value = emp.joiningDate;
        document.getElementById("status").value = emp.status;

        const submitBtn = document.getElementById("submitBtn");

        if (submitBtn) {
            submitBtn.textContent = "Update Employee";
        }

        document.getElementById("employeeFormSection")
            .scrollIntoView({ behavior: "smooth" });
    };

    // DELETE EMPLOYEE
    window.deleteEmployee = function (id) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this employee?"
        );

        if (!confirmDelete) return;

        employees = employees.filter(function (emp) {
            return emp.id !== id;
        });

        saveData();
        displayEmployees();

        alert("Employee Deleted Successfully!");
    };

    // SEARCH AND FILTER
    function filterEmployees() {

        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const selectedDepartment = departmentFilter
            ? departmentFilter.value
            : "";

        const filtered = employees.filter(function (emp) {

            const matchesSearch =
                String(emp.name).toLowerCase().includes(searchText) ||
                String(emp.id).toLowerCase().includes(searchText) ||
                String(emp.email).toLowerCase().includes(searchText);

            const matchesDepartment =
                !selectedDepartment ||
                emp.department === selectedDepartment;

            return matchesSearch && matchesDepartment;
        });

        displayEmployees(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterEmployees);
    }

    if (departmentFilter) {
        departmentFilter.addEventListener("change", filterEmployees);
    }

    // EXPORT EMPLOYEES CSV
    window.exportEmployees = function () {

        if (employees.length === 0) {
            alert("No employee data to export.");
            return;
        }

        const headers = [
            "Employee ID",
            "Name",
            "Email",
            "Phone",
            "Department",
            "Salary",
            "Joining Date",
            "Status"
        ];

        const rows = employees.map(function (emp) {
            return [
                emp.id,
                emp.name,
                emp.email,
                emp.phone,
                emp.department,
                emp.salary,
                emp.joiningDate,
                emp.status
            ];
        });

        function csvValue(value) {
            return '"' + String(value ?? "").replace(/"/g, '""') + '"';
        }

        const csvContent = [
            headers,
            ...rows
        ].map(function (row) {
            return row.map(csvValue).join(",");
        }).join("\n");

        const blob = new Blob(
            ["\uFEFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "employee-report.csv";
        link.click();

        URL.revokeObjectURL(url);
    };

    // PRINT EMPLOYEE REPORT
    window.printEmployeeReport = function () {

        if (employees.length === 0) {
            alert("No employee data to print.");
            return;
        }

        const rows = employees.map(function (emp) {
            return `
                <tr>
                    <td>${escapeHTML(emp.id)}</td>
                    <td>${escapeHTML(emp.name)}</td>
                    <td>${escapeHTML(emp.email)}</td>
                    <td>${escapeHTML(emp.phone)}</td>
                    <td>${escapeHTML(emp.department)}</td>
                    <td>₹${Number(emp.salary || 0).toLocaleString("en-IN")}</td>
                    <td>${escapeHTML(emp.joiningDate)}</td>
                    <td>${escapeHTML(emp.status)}</td>
                </tr>
            `;
        }).join("");

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            alert("Please allow pop-ups to print the report.");
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Employee Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }

                    h2 {
                        text-align: center;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    th, td {
                        border: 1px solid #333;
                        padding: 8px;
                        text-align: left;
                    }

                    th {
                        background: #ddd;
                    }

                    button {
                        padding: 10px 20px;
                        margin: 15px 0;
                    }

                    @media print {
                        button {
                            display: none;
                        }
                    }
                </style>
            </head>

            <body>
                <h2>Employee Management System</h2>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Department</th>
                            <th>Salary</th>
                            <th>Joining Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>
                </table>

                <button onclick="window.print()">Print Report</button>
            </body>
            </html>
        `);

        printWindow.document.close();
    };

    // LOGOUT
    window.logout = function () {
        window.location.href = "login.html";
    };

    // INITIAL LOAD
    saveData();
    displayEmployees();

});
