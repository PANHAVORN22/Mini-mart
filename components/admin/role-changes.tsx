"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRoleChanges } from "@/lib/actions/admin";

interface RoleChange {
  id: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetName: string;
  oldRole: string;
  newRole: string;
  createdAt: string;
}

export function RoleChanges() {
  const [changes, setChanges] = useState<RoleChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await getRoleChanges();
      setChanges(res);
      setIsLoading(false);
    };

    fetch();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading audits...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Change Audit</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Old Role</TableHead>
                <TableHead>New Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {new Date(c.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{c.adminName}</TableCell>
                  <TableCell>{c.targetName}</TableCell>
                  <TableCell className="capitalize">{c.oldRole}</TableCell>
                  <TableCell className="capitalize">{c.newRole}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
