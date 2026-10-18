<?php

final class User extends ModelCrud
{
    protected $creatableFields =
    [
        'name',
        'email',
        'phone',
        'hashword',
    ];
    protected $updatableFields =
    [
        'name',
        'email',
        'phone',
    ];

    protected function onReadRow(array &$user): void
    {
        unset($user['hashword']);
    }

    public function readHashword(int|string $id_or_email): ?string
    {
        $sql = is_numeric($id_or_email)
            ? $this->buildSelectSql($id_or_email, null, null, null)
            : $this->buildSelectSql(null, null, "email='".$this->realEscapeString($id_or_email)."'", null);

        $row = $this->executeQuery($sql)
            ->fetch_assoc();

        if (!isset($row['hashword']))
            return null;

        return $row['hashword'];
    }
    public function updateHashword(int|string $id_or_email, string $hashword): void
    {
        $escHashword = $this->realEscapeString($hashword);
        $sql = "UPDATE $this->tableName SET hashword='$escHashword'".
            ' WHERE '.(is_numeric($id_or_email)
                ? "id=$id_or_email"
                : "email='".$this->realEscapeString($id_or_email)."'"
            );

        $this->executeQuery($sql);
    }

    public function readByEmail(string $email): ?array
    {
        $escEmail = $this->realEscapeString($email);
        $res = $this->read(null, null, null, "email='$escEmail'");

        if (empty($res))
            return null;

        return $res[0];
    }
}