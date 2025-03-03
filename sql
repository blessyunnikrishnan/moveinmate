
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    role NVARCHAR(50) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    additional_data NVARCHAR(MAX) DEFAULT '{}',
    mobile_number NVARCHAR(15) NULL,
    irp NVARCHAR(MAX) DEFAULT ''
);

CREATE TABLE Houses (
    house_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(), -- UUID as primary key
    dealer_id INT REFERENCES Users(id) ON DELETE CASCADE, -- Now matches Users.id data type
    name VARCHAR(100) NOT NULL,
    location VARCHAR(500) NOT NULL,
    bedrooms INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    house_type VARCHAR(255) NOT NULL,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    allotted_to INT NULL REFERENCES Users(id) -- Matches Users.id data type, nullable
);

CREATE TABLE Bookings (
    booking_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    house_id UNIQUEIDENTIFIER NOT NULL REFERENCES Houses(house_id) ON DELETE CASCADE,  -- Cascade delete for Houses
    user_id INT NOT NULL REFERENCES Users(id) ON DELETE NO ACTION,  -- No cascade delete for Users
    booking_date DATETIME DEFAULT GETDATE(),
    booking_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    allocated_to INT NULL REFERENCES Users(id),
    is_approved BIT NOT NULL DEFAULT 0,
    UNIQUE (house_id, start_date, end_date)
);








