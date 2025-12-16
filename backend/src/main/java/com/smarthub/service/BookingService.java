package com.smarthub.service;

import com.smarthub.dto.BookingRequest;
import com.smarthub.entity.Booking;
import com.smarthub.entity.Notification;
import com.smarthub.exception.ResourceNotFoundException;
import com.smarthub.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    // Date formatters for notifications
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    
    /**
     * Create a new booking and send notification to provider
     */
    public Booking createBooking(BookingRequest request) {
        Booking booking = new Booking();
        booking.setUserId(request.getUserId());
        booking.setProviderId(request.getProviderId());
        booking.setServiceType(request.getServiceType());
        booking.setBookingDate(request.getBookingDate());
        booking.setBookingTime(request.getBookingTime());
        booking.setStatus(Booking.BookingStatus.PENDING);
        
        Booking savedBooking = bookingRepository.save(booking);
        
        try {
            String formattedDate = savedBooking.getBookingDate().format(DATE_FORMATTER);
            String formattedTime = savedBooking.getBookingTime().format(TIME_FORMATTER);
            
            Notification notification = new Notification();
            notification.setReceiverId(savedBooking.getProviderId());
            notification.setReceiverType("PROVIDER");
            notification.setMessage("🔔 New booking request from User #" + savedBooking.getUserId() + 
                                   " for " + savedBooking.getServiceType() + 
                                   " on " + formattedDate + " at " + formattedTime);
            notification.setType("BOOKING_REQUEST");
            notification.setStatus("UNREAD");
            notification.setRelatedBookingId(savedBooking.getBookingId());
            
            notificationService.createNotification(notification);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to create notification: " + e.getMessage());
            e.printStackTrace();
        }
        
        return savedBooking;
    }
    
    public List<Booking> getUserBookings(Integer userId) {
        return bookingRepository.findByUserId(userId);
    }
    
    public List<Booking> getProviderBookings(Integer providerId) {
        return bookingRepository.findByProviderId(providerId);
    }
    
    public Booking updateBookingStatus(Integer bookingId, String status) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        try {
            String normalizedStatus = status.toUpperCase().trim();
            
            // Map CONFIRMED to ACCEPTED
            if ("CONFIRMED".equals(normalizedStatus)) {
                normalizedStatus = "ACCEPTED";
            }
            
            Booking.BookingStatus newStatus;
            try {
                newStatus = Booking.BookingStatus.valueOf(normalizedStatus);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid booking status: " + status);
            }
            
            booking.setStatus(newStatus);
            Booking updatedBooking = bookingRepository.save(booking);
            
            try {
                String formattedDate = booking.getBookingDate().format(DATE_FORMATTER);
                
                Notification notification = new Notification();
                notification.setReceiverId(booking.getUserId());
                notification.setReceiverType("USER");
                notification.setRelatedBookingId(bookingId);
                notification.setStatus("UNREAD");
                
                switch (newStatus) {
                    case ACCEPTED:
                    case CONFIRMED:
                        notification.setType("BOOKING_ACCEPTED");
                        notification.setMessage("✅ Great news! Your booking for " + booking.getServiceType() + 
                                              " on " + formattedDate + " has been accepted by the provider!");
                        break;
                        
                    case REJECTED:
                        notification.setType("BOOKING_REJECTED");
                        notification.setMessage("❌ Sorry, your booking for " + booking.getServiceType() + 
                                              " on " + formattedDate + " has been rejected. Please try another provider.");
                        break;
                        
                    case COMPLETED:
                        notification.setType("BOOKING_COMPLETED");
                        notification.setMessage("🎉 Your booking for " + booking.getServiceType() + " has been completed! Thank you for using our service.");
                        break;
                        
                    case CANCELLED:
                        notification.setType("BOOKING_CANCELLED");
                        notification.setMessage("🚫 Your booking for " + booking.getServiceType() + " has been cancelled.");
                        break;
                        
                    default:
                        notification.setType("BOOKING_UPDATE");
                        notification.setMessage("ℹ️ Your booking for " + booking.getServiceType() + " status has been updated to: " + newStatus);
                }
                
                notificationService.createNotification(notification);
            } catch (Exception e) {
                System.err.println("⚠️ Failed to create notification: " + e.getMessage());
                e.printStackTrace();
            }
            
            return updatedBooking;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update booking status: " + e.getMessage(), e);
        }
    }
    
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public Booking cancelBooking(Integer bookingId, Integer userId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        
        if (!booking.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only cancel your own bookings");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking cancelledBooking = bookingRepository.save(booking);
        
        try {
            String formattedDate = booking.getBookingDate().format(DATE_FORMATTER);
            
            Notification notification = new Notification();
            notification.setReceiverId(booking.getProviderId());
            notification.setReceiverType("PROVIDER");
            notification.setMessage("🚫 User #" + userId + " has cancelled their booking for " + 
                                   booking.getServiceType() + " on " + formattedDate);
            notification.setType("BOOKING_CANCELLED");
            notification.setStatus("UNREAD");
            notification.setRelatedBookingId(bookingId);
            
            notificationService.createNotification(notification);
        } catch (Exception e) {
            System.err.println("⚠️ Failed to create notification: " + e.getMessage());
            e.printStackTrace();
        }
        
        return cancelledBooking;
    }
    
    public Booking getBookingById(Integer bookingId) {
        return bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
    }
}
