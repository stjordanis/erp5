# Host:
# Database: test
# Table: 'catalog'
#
CREATE TABLE `catalog` (
  `uid` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `security_uid` INT UNSIGNED,
  `path` varchar(255) NOT NULL default '',
  `relative_url` varchar(255) NOT NULL default '',
  `parent_uid` BIGINT UNSIGNED default '0',
  `id` varchar(255) default '',
  `description` text,
  `title` varchar(255) default '',
  `meta_type` varchar(255) default '',
  `portal_type` varchar(255) default '',
  `opportunity_state` varchar(255) default '',
  `corporate_registration_code` varchar(255),
  `ean13_code` varchar(255),
  `validation_state` varchar(255) default '',
  `simulation_state` varchar(255) default '',
  `causality_state` varchar(255) default '',
  `invoice_state` varchar(255) default '',
  `payment_state` varchar(255) default '',
  `event_state` varchar(255) default '',
  `immobilisation_state` varchar(255) default '',
  `reference` varchar(255) default '',
  `grouping_reference` varchar(255) default '',
  `source_reference` varchar(255) default '',
  `destination_reference` varchar(255) default '',
  `string_index` varchar(255),
  `int_index` INT,
  `float_index` real,
  `has_cell_content` bool,
  `creation_date` datetime,
  `modification_date` datetime,
  PRIMARY KEY  (`uid`),
  KEY `security_uid` (`security_uid`),
  KEY `Parent` (`parent_uid`),
  KEY `Path` (`path`),
  KEY `Title` (`title`),
  KEY `Reference` (`reference`),
  KEY `relative_url` (`relative_url`),
  KEY `Portal Type` (`portal_type`),
  KEY `opportunity_state` (`opportunity_state`),
  KEY `validation_state` (`validation_state`),
  KEY `simulation_state` (`simulation_state`),
  KEY `causality_state` (`causality_state`),
  KEY `invoice_state` (`invoice_state`),
  KEY `payment_state` (`payment_state`),
  KEY `event_state` (`event_state`)
) TYPE=ndb;