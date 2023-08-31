CREATE TABLE `sssf_cat` (
  `cat_id` int(11) NOT NULL,
  `cat_name` text NOT NULL,
  `weight` float NOT NULL,
  `owner` int(11) NOT NULL,
  `filename` text NOT NULL,
  `birthdate` date DEFAULT NULL,
  `coords` point NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE `sssf_cat`
  ADD PRIMARY KEY (`cat_id`),
  ADD KEY `owner` (`owner`);

ALTER TABLE `sssf_cat`
  MODIFY `cat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;
COMMIT;

INSERT INTO `sssf_cat` (`cat_id`, `cat_name`, `weight`, `owner`, `filename`, `birthdate`, `coords`) VALUES
(41, 'Siiri', 4, 37, 'some_filename', '2010-03-05', 0x00000000010100000064f188f709214e408d976e1283d83840);

CREATE TABLE `sssf_user` (
  `user_id` int(11) NOT NULL,
  `user_name` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `role` text NOT NULL DEFAULT ('user')
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

ALTER TABLE `sssf_user`
  ADD PRIMARY KEY (`user_id`);
  
 ALTER TABLE `sssf_user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;
COMMIT;

INSERT INTO `sssf_user` (`user_id`, `user_name`, `email`, `password`, `role`) VALUES
(1, 'admin', 'admin@metropolia.fi', '$2a$10$5RzpyimIeuzNqW7G8seBiOzBiWBvrSWroDomxMa0HzU6K2ddSgixS', 'admin'),
(37, 'Test User', 'john@metropolia.fi', '$2a$10$5RzpyimIeuzNqW7G8seBiOzBiWBvrSWroDomxMa0HzU6K2ddSgixS', 'user'); 
