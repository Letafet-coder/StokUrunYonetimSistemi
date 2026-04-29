using System;

namespace Backend.Models
{
    public class LotSerial
    {
        public int Id { get; set; }
        public string Identifier { get; set; } = string.Empty; // e.g. Batch # or Serial S/N
        public int ProductId { get; set; }
        public Product? Product { get; set; }
        
        public DateTime? ExpirationDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Custom properties for business logic
        public bool IsExpired => ExpirationDate.HasValue && ExpirationDate.Value < DateTime.UtcNow;
    }
}
