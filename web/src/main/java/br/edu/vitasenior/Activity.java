package br.edu.vitasenior;

public record Activity(long id, String title, String description, String dateTime, String place, int capacity, int booked) {}
