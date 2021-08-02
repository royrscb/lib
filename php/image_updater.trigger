CREATE TRIGGER `data image updater` BEFORE UPDATE ON `data`
 FOR EACH ROW IF old.type = 'image' THEN

    IF old.value IS NOT NULL THEN

        UPDATE image SET field_data=NULL WHERE field_data=old.field;
        
    END IF;

    IF new.value IS NOT NULL THEN

		UPDATE image SET field_data=old.field WHERE id=new.value;
        
    END IF;

END IF
