using BCrypt.Net;
using System;

// This is just to generate the hash string to be used in SQL
string password = "admin123";
string hash = BCrypt.Net.BCrypt.HashPassword(password);
Console.WriteLine(hash);
