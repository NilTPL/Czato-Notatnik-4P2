-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Lis 07, 2025 at 02:47 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `czatonotatnik-4p`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `board`
--

CREATE TABLE `board` (
  `ID` int(11) NOT NULL,
  `content` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `board`
--

INSERT INTO `board` (`ID`, `content`, `timestamp`) VALUES
(1, 'Witajcie na tablicy nauczyciela!\n\nDzisiejsze tematy:\n1. Wprowadzenie do JavaScript\n2. Praca z API\n3. Projekt grupowy\n\nZadanie domowe: Stworzenie prostej aplikacji webowej.', '2025-11-07 13:45:00');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `messages`
--

CREATE TABLE `messages` (
  `ID` int(11) NOT NULL,
  `user_ID` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`ID`, `user_ID`, `username`, `content`, `created_at`) VALUES
(1, 1, 'nauczyciel', 'Witam wszystkich na czacie!', '2025-11-07 13:46:00'),
(2, 2, 'uczen1', 'Dzień dobry, mam pytanie odnośnie zadania domowego', '2025-11-07 13:47:00'),
(3, 3, 'uczen2', 'Ja też mam pytanie', '2025-11-07 13:48:00');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `notes`
--

CREATE TABLE `notes` (
  `ID` int(11) NOT NULL,
  `user_ID` int(11) NOT NULL,
  `title` varchar(255) DEFAULT 'Nowa notatka',
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `notes`
--

INSERT INTO `notes` (`ID`, `user_ID`, `title`, `content`, `created_at`, `updated_at`) VALUES
(1, 2, 'Zadanie domowe', 'Przeczytać rozdział 5 z podręcznika', '2025-11-07 13:49:00', '2025-11-07 13:49:00'),
(2, 2, 'Przygotowanie do testu', 'Przygotować się do testu z JavaScript', '2025-11-07 13:50:00', '2025-11-07 13:50:00'),
(3, 3, 'Moje notatki', 'Zapytać o projekt grupowy', '2025-11-07 13:51:00', '2025-11-07 13:51:00');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `ID` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('teacher','student') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `username`, `password`, `role`, `created_at`, `last_login`, `is_online`) VALUES
(1, 'nauczyciel', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', '2025-11-07 13:45:00', '2025-11-07 13:45:00', 1),
(2, 'uczen1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', '2025-11-07 13:45:00', '2025-11-07 13:45:00', 1),
(3, 'uczen2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', '2025-11-07 13:45:00', '2025-11-07 13:45:00', 1),
(4, 'uczen3', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student', '2025-11-07 13:45:00', NULL, 0);

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `board`
--
ALTER TABLE `board`
  ADD PRIMARY KEY (`ID`);

--
-- Indeksy dla tabeli `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `user_ID` (`user_ID`);

--
-- Indeksy dla tabeli `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `user_ID` (`user_ID`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `board`
--
ALTER TABLE `board`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`ID`);

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`user_ID`) REFERENCES `users` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;